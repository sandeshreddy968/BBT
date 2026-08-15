from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.catalog import CatalogItem
from app.models.ci import CI
from app.models.change import Change
from app.models.enums import (
    ArticleStatus,
    ChangeStatus,
    IncidentStatus,
    Priority,
    ProblemStatus,
    RequestStatus,
    Role,
)
from app.models.incident import Incident
from app.models.knowledge import KnowledgeArticle
from app.models.problem import Problem
from app.models.request import ServiceRequest
from app.models.user import User
from app.schemas.dashboard import ActivityItem, BreakdownItem, DashboardBreakdown, DashboardSummary, TrendPoint

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_OPEN_INCIDENT_STATUSES = [IncidentStatus.new.value, IncidentStatus.in_progress.value, IncidentStatus.on_hold.value]
_OPEN_PROBLEM_STATUSES = [ProblemStatus.new.value, ProblemStatus.investigating.value, ProblemStatus.root_cause_identified.value]
_OPEN_CHANGE_STATUSES = [ChangeStatus.draft.value, ChangeStatus.submitted.value, ChangeStatus.approved.value]
_PENDING_REQUEST_STATUSES = [RequestStatus.submitted.value, RequestStatus.approved.value, RequestStatus.in_progress.value]


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    incident_query = db.query(Incident)
    request_query = db.query(ServiceRequest)
    if current_user.role != Role.admin.value:
        incident_query = incident_query.filter(Incident.caller_id == current_user.id)
        request_query = request_query.filter(ServiceRequest.requested_by_id == current_user.id)

    return DashboardSummary(
        open_incidents=incident_query.filter(Incident.status.in_(_OPEN_INCIDENT_STATUSES)).count(),
        my_incidents=db.query(Incident).filter(Incident.caller_id == current_user.id).count(),
        open_problems=db.query(Problem).filter(Problem.status.in_(_OPEN_PROBLEM_STATUSES)).count(),
        open_changes=db.query(Change).filter(Change.status.in_(_OPEN_CHANGE_STATUSES)).count(),
        pending_requests=request_query.filter(ServiceRequest.status.in_(_PENDING_REQUEST_STATUSES)).count(),
        total_cis=db.query(CI).count(),
        published_articles=db.query(KnowledgeArticle).filter(KnowledgeArticle.status == ArticleStatus.published.value).count(),
    )


@router.get("/breakdown", response_model=DashboardBreakdown)
def breakdown(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    incident_query = db.query(Incident)
    if current_user.role != Role.admin.value:
        incident_query = incident_query.filter(Incident.caller_id == current_user.id)
    incidents = incident_query.all()

    status_counts = Counter(i.status for i in incidents)
    priority_counts = Counter(i.priority for i in incidents)

    return DashboardBreakdown(
        incidents_by_status=[
            BreakdownItem(label=s.value, count=status_counts.get(s.value, 0)) for s in IncidentStatus
        ],
        incidents_by_priority=[
            BreakdownItem(label=p.value, count=priority_counts.get(p.value, 0)) for p in Priority
        ],
    )


@router.get("/trend", response_model=list[TrendPoint])
def trend(days: int = 14, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    since = datetime.utcnow() - timedelta(days=days - 1)
    is_admin = current_user.role == Role.admin.value

    incident_query = db.query(Incident).filter(Incident.created_at >= since)
    request_query = db.query(ServiceRequest).filter(ServiceRequest.created_at >= since)
    change_query = db.query(Change).filter(Change.created_at >= since)
    if not is_admin:
        incident_query = incident_query.filter(Incident.caller_id == current_user.id)
        request_query = request_query.filter(ServiceRequest.requested_by_id == current_user.id)
        change_query = change_query.filter(Change.requested_by_id == current_user.id)

    buckets = {
        (since + timedelta(days=i)).date().isoformat(): {"incidents": 0, "requests": 0, "changes": 0}
        for i in range(days)
    }
    for row in incident_query.all():
        key = row.created_at.date().isoformat()
        if key in buckets:
            buckets[key]["incidents"] += 1
    for row in request_query.all():
        key = row.created_at.date().isoformat()
        if key in buckets:
            buckets[key]["requests"] += 1
    for row in change_query.all():
        key = row.created_at.date().isoformat()
        if key in buckets:
            buckets[key]["changes"] += 1

    return [TrendPoint(date=d, **counts) for d, counts in sorted(buckets.items())]


@router.get("/activity", response_model=list[ActivityItem])
def activity(limit: int = 8, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_admin = current_user.role == Role.admin.value
    items: list[ActivityItem] = []

    incident_query = db.query(Incident)
    request_query = db.query(ServiceRequest)
    if not is_admin:
        incident_query = incident_query.filter(Incident.caller_id == current_user.id)
        request_query = request_query.filter(ServiceRequest.requested_by_id == current_user.id)

    for i in incident_query.order_by(Incident.updated_at.desc()).limit(limit).all():
        items.append(
            ActivityItem(
                type="incident", number=i.number, title=i.title, status=i.status,
                updated_at=i.updated_at, url=f"/incidents/{i.id}",
            )
        )

    catalog_names = {c.id: c.name for c in db.query(CatalogItem).all()}
    for r in request_query.order_by(ServiceRequest.updated_at.desc()).limit(limit).all():
        items.append(
            ActivityItem(
                type="request", number=r.number,
                title=catalog_names.get(r.catalog_item_id, "Service request"),
                status=r.status, updated_at=r.updated_at, url=f"/requests/{r.id}",
            )
        )

    if is_admin:
        for p in db.query(Problem).order_by(Problem.updated_at.desc()).limit(limit).all():
            items.append(
                ActivityItem(
                    type="problem", number=p.number, title=p.title, status=p.status,
                    updated_at=p.updated_at, url=f"/problems/{p.id}",
                )
            )
        for c in db.query(Change).order_by(Change.updated_at.desc()).limit(limit).all():
            items.append(
                ActivityItem(
                    type="change", number=c.number, title=c.title, status=c.status,
                    updated_at=c.updated_at, url=f"/changes/{c.id}",
                )
            )

    items.sort(key=lambda item: item.updated_at, reverse=True)
    return items[:limit]
