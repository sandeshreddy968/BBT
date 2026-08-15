from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import notes_service
from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.base import make_number
from app.models.catalog import CatalogItem
from app.models.enums import RequestStatus, Role, TicketType
from app.models.request import ServiceRequest
from app.models.user import User
from app.schemas.note import TicketNoteCreate, TicketNoteRead
from app.schemas.request import (
    PaginatedRequests,
    ServiceRequestClose,
    ServiceRequestCreate,
    ServiceRequestRead,
    ServiceRequestUpdate,
)

router = APIRouter(prefix="/requests", tags=["requests"])


def _get_owned_or_404(db: Session, request_id: int, current_user: User) -> ServiceRequest:
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if current_user.role != Role.admin.value and req.requested_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return req


@router.get("", response_model=PaginatedRequests)
def list_requests(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ServiceRequest)
    if current_user.role != Role.admin.value:
        query = query.filter(ServiceRequest.requested_by_id == current_user.id)
    if status_filter:
        query = query.filter(ServiceRequest.status == status_filter)
    total = query.count()
    items = query.order_by(ServiceRequest.id.desc()).offset(skip).limit(limit).all()
    return PaginatedRequests(items=items, total=total)


@router.post("", response_model=ServiceRequestRead, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: ServiceRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    catalog_item = db.query(CatalogItem).filter(CatalogItem.id == payload.catalog_item_id).first()
    if not catalog_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")
    data = payload.model_dump(exclude={"contact_type", "environment"})
    req = ServiceRequest(
        **data,
        contact_type=payload.contact_type.value if payload.contact_type else None,
        environment=payload.environment.value if payload.environment else None,
        requested_by_id=current_user.id,
        number="",
    )
    db.add(req)
    db.flush()
    req.number = make_number("REQ", req.id)
    db.commit()
    db.refresh(req)
    return req


@router.get("/{request_id}", response_model=ServiceRequestRead)
def get_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_owned_or_404(db, request_id, current_user)


@router.patch("/{request_id}", response_model=ServiceRequestRead)
def update_request(
    request_id: int,
    payload: ServiceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = _get_owned_or_404(db, request_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(req, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/approve", response_model=ServiceRequestRead)
def approve_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    req.status = RequestStatus.approved.value
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/fulfill", response_model=ServiceRequestRead)
def fulfill_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    req.status = RequestStatus.fulfilled.value
    req.fulfilled_by_id = current_user.id
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/reject", response_model=ServiceRequestRead)
def reject_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    req.status = RequestStatus.rejected.value
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/close", response_model=ServiceRequestRead)
def close_request(
    request_id: int,
    payload: ServiceRequestClose,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    req.status = RequestStatus.closed.value
    req.close_code = payload.close_code
    req.resolution_code = payload.resolution_code
    req.closed_by_id = current_user.id
    req.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)
    return req


@router.get("/{request_id}/notes", response_model=list[TicketNoteRead])
def list_request_notes(
    request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _get_owned_or_404(db, request_id, current_user)
    return notes_service.list_notes(
        db, TicketType.request.value, request_id, customer_visible_only=current_user.role != Role.admin.value
    )


@router.post("/{request_id}/notes", response_model=TicketNoteRead, status_code=status.HTTP_201_CREATED)
def add_request_note(
    request_id: int,
    payload: TicketNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_or_404(db, request_id, current_user)
    is_visible = payload.is_customer_visible if current_user.role == Role.admin.value else True
    return notes_service.create_note(
        db, TicketType.request.value, request_id, current_user.id, payload.body, is_visible
    )
