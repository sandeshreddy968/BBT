from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import notes_service
from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.base import make_number
from app.models.enums import ProblemStatus, Role, TicketType
from app.models.incident import Incident
from app.models.problem import Problem
from app.models.user import User
from app.schemas.note import TicketNoteCreate, TicketNoteRead
from app.schemas.problem import (
    PaginatedProblems,
    ProblemClose,
    ProblemCreate,
    ProblemRead,
    ProblemResolve,
    ProblemUpdate,
)

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=PaginatedProblems)
def list_problems(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Problem)
    if status_filter:
        query = query.filter(Problem.status == status_filter)
    total = query.count()
    items = query.order_by(Problem.id.desc()).offset(skip).limit(limit).all()
    return PaginatedProblems(items=items, total=total)


@router.post("", response_model=ProblemRead, status_code=status.HTTP_201_CREATED)
def create_problem(payload: ProblemCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    data = payload.model_dump(exclude={"priority", "impact", "urgency", "environment"})
    problem = Problem(
        **data,
        priority=payload.priority.value,
        impact=payload.impact.value if payload.impact else None,
        urgency=payload.urgency.value if payload.urgency else None,
        environment=payload.environment.value if payload.environment else None,
        created_by_id=current_user.id,
        number="",
    )
    db.add(problem)
    db.flush()
    problem.number = make_number("PRB", problem.id)
    db.commit()
    db.refresh(problem)
    return problem


@router.get("/{problem_id}", response_model=ProblemRead)
def get_problem(problem_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    return problem


@router.patch("/{problem_id}", response_model=ProblemRead)
def update_problem(
    problem_id: int, payload: ProblemUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(problem, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(problem)
    return problem


@router.post("/{problem_id}/link-incident/{incident_id}", response_model=ProblemRead)
def link_incident(
    problem_id: int, incident_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    incident.problem_id = problem.id
    db.commit()
    db.refresh(problem)
    return problem


@router.post("/{problem_id}/resolve", response_model=ProblemRead)
def resolve_problem(
    problem_id: int,
    payload: ProblemResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    problem.status = ProblemStatus.resolved.value
    problem.root_cause = payload.root_cause
    if payload.workaround:
        problem.workaround = payload.workaround
    problem.resolution_code = payload.resolution_code
    problem.resolved_by_id = current_user.id
    problem.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(problem)
    return problem


@router.post("/{problem_id}/close", response_model=ProblemRead)
def close_problem(
    problem_id: int,
    payload: ProblemClose,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    problem.status = ProblemStatus.closed.value
    problem.close_code = payload.close_code
    problem.closed_by_id = current_user.id
    problem.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(problem)
    return problem


@router.get("/{problem_id}/notes", response_model=list[TicketNoteRead])
def list_problem_notes(
    problem_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return notes_service.list_notes(
        db, TicketType.problem.value, problem_id, customer_visible_only=current_user.role != Role.admin.value
    )


@router.post("/{problem_id}/notes", response_model=TicketNoteRead, status_code=status.HTTP_201_CREATED)
def add_problem_note(
    problem_id: int,
    payload: TicketNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_visible = payload.is_customer_visible if current_user.role == Role.admin.value else True
    return notes_service.create_note(
        db, TicketType.problem.value, problem_id, current_user.id, payload.body, is_visible
    )
