from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.base import make_number
from app.models.enums import IncidentStatus, Role
from app.models.incident import Incident
from app.models.user import User
from app.schemas.incident import (
    IncidentAssign,
    IncidentCreate,
    IncidentRead,
    IncidentResolve,
    IncidentUpdate,
    PaginatedIncidents,
)

router = APIRouter(prefix="/incidents", tags=["incidents"])


def _get_owned_or_404(db: Session, incident_id: int, current_user: User) -> Incident:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    if current_user.role != Role.admin.value and incident.caller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return incident


@router.get("", response_model=PaginatedIncidents)
def list_incidents(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = Query(None, alias="status"),
    priority: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Incident)
    if current_user.role != Role.admin.value:
        query = query.filter(Incident.caller_id == current_user.id)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if priority:
        query = query.filter(Incident.priority == priority)
    if q:
        query = query.filter(Incident.title.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(Incident.id.desc()).offset(skip).limit(limit).all()
    return PaginatedIncidents(items=items, total=total)


@router.post("", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: IncidentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    incident = Incident(
        title=payload.title,
        description=payload.description,
        priority=payload.priority.value,
        category=payload.category,
        ci_id=payload.ci_id,
        caller_id=current_user.id,
        number="",
    )
    db.add(incident)
    db.flush()
    incident.number = make_number("INC", incident.id)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(
    incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_owned_or_404(db, incident_id, current_user)


@router.patch("/{incident_id}", response_model=IncidentRead)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = _get_owned_or_404(db, incident_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(incident, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/assign", response_model=IncidentRead)
def assign_incident(
    incident_id: int,
    payload: IncidentAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != Role.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    incident.assigned_to_id = payload.assigned_to_id
    incident.status = IncidentStatus.in_progress.value
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/resolve", response_model=IncidentRead)
def resolve_incident(
    incident_id: int,
    payload: IncidentResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != Role.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    incident.status = IncidentStatus.resolved.value
    incident.resolution_notes = payload.resolution_notes
    incident.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/close", response_model=IncidentRead)
def close_incident(
    incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != Role.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    incident.status = IncidentStatus.closed.value
    incident.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/reopen", response_model=IncidentRead)
def reopen_incident(
    incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != Role.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    incident.status = IncidentStatus.in_progress.value
    incident.resolved_at = None
    incident.closed_at = None
    db.commit()
    db.refresh(incident)
    return incident
