from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ContactType, EnvironmentType, ImpactUrgencyLevel, Priority


class IncidentCreate(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.medium
    category: str | None = None
    ci_id: int | None = None
    subcategory: str | None = None
    contact_type: ContactType | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    impact: ImpactUrgencyLevel | None = None
    urgency: ImpactUrgencyLevel | None = None
    related_incident_id: int | None = None


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: Priority | None = None
    category: str | None = None
    ci_id: int | None = None
    subcategory: str | None = None
    contact_type: ContactType | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    impact: ImpactUrgencyLevel | None = None
    urgency: ImpactUrgencyLevel | None = None
    hold_reason: str | None = None
    problem_id: int | None = None
    change_id: int | None = None
    related_incident_id: int | None = None


class IncidentResolve(BaseModel):
    resolution_notes: str
    resolution_code: str | None = None


class IncidentClose(BaseModel):
    close_code: str | None = None


class IncidentHold(BaseModel):
    hold_reason: str


class IncidentAssign(BaseModel):
    assigned_to_id: int


class IncidentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    title: str
    description: str
    status: str
    priority: str
    category: str | None
    subcategory: str | None
    contact_type: str | None
    service: str | None
    business_service: str | None
    location: str | None
    department: str | None
    environment: str | None
    assignment_group: str | None
    knowledge_article: str | None
    impact: str | None
    urgency: str | None
    hold_reason: str | None
    ci_id: int | None
    caller_id: int
    assigned_to_id: int | None
    problem_id: int | None
    change_id: int | None
    related_incident_id: int | None
    resolution_notes: str | None
    resolution_code: str | None
    resolved_by_id: int | None
    resolved_at: datetime | None
    close_code: str | None
    closed_by_id: int | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedIncidents(BaseModel):
    items: list[IncidentRead]
    total: int
