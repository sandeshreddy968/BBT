from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.base import make_number
from app.models.change import Change
from app.models.enums import ChangeStatus
from app.models.user import User
from app.schemas.change import ChangeCreate, ChangeRead, ChangeUpdate, PaginatedChanges

router = APIRouter(prefix="/changes", tags=["changes"])


def _get_or_404(db: Session, change_id: int) -> Change:
    change = db.query(Change).filter(Change.id == change_id).first()
    if not change:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")
    return change


@router.get("", response_model=PaginatedChanges)
def list_changes(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Change)
    if status_filter:
        query = query.filter(Change.status == status_filter)
    total = query.count()
    items = query.order_by(Change.id.desc()).offset(skip).limit(limit).all()
    return PaginatedChanges(items=items, total=total)


@router.post("", response_model=ChangeRead, status_code=status.HTTP_201_CREATED)
def create_change(payload: ChangeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    change = Change(
        title=payload.title,
        description=payload.description,
        change_type=payload.change_type.value,
        risk=payload.risk.value,
        ci_id=payload.ci_id,
        problem_id=payload.problem_id,
        planned_start=payload.planned_start,
        planned_end=payload.planned_end,
        implementation_plan=payload.implementation_plan,
        backout_plan=payload.backout_plan,
        requested_by_id=current_user.id,
        number="",
    )
    db.add(change)
    db.flush()
    change.number = make_number("CHG", change.id)
    db.commit()
    db.refresh(change)
    return change


@router.get("/{change_id}", response_model=ChangeRead)
def get_change(change_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return _get_or_404(db, change_id)


@router.patch("/{change_id}", response_model=ChangeRead)
def update_change(
    change_id: int, payload: ChangeUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    change = _get_or_404(db, change_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(change, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(change)
    return change


@router.post("/{change_id}/submit", response_model=ChangeRead)
def submit_change(change_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    change = _get_or_404(db, change_id)
    change.status = ChangeStatus.submitted.value
    db.commit()
    db.refresh(change)
    return change


@router.post("/{change_id}/approve", response_model=ChangeRead)
def approve_change(change_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    change = _get_or_404(db, change_id)
    change.status = ChangeStatus.approved.value
    change.approved_by_id = current_user.id
    db.commit()
    db.refresh(change)
    return change


@router.post("/{change_id}/reject", response_model=ChangeRead)
def reject_change(change_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    change = _get_or_404(db, change_id)
    change.status = ChangeStatus.rejected.value
    change.approved_by_id = current_user.id
    db.commit()
    db.refresh(change)
    return change


@router.post("/{change_id}/implement", response_model=ChangeRead)
def implement_change(change_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    change = _get_or_404(db, change_id)
    change.status = ChangeStatus.implemented.value
    db.commit()
    db.refresh(change)
    return change


@router.post("/{change_id}/close", response_model=ChangeRead)
def close_change(change_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    change = _get_or_404(db, change_id)
    change.status = ChangeStatus.closed.value
    db.commit()
    db.refresh(change)
    return change
