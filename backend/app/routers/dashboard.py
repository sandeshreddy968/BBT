from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.ci import CI
from app.models.change import Change
from app.models.enums import ArticleStatus, ChangeStatus, IncidentStatus, ProblemStatus, RequestStatus, Role
from app.models.incident import Incident
from app.models.knowledge import KnowledgeArticle
from app.models.problem import Problem
from app.models.request import ServiceRequest
from app.models.user import User
from app.schemas.dashboard import DashboardSummary

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
