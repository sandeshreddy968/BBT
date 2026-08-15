from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import EnvironmentType, ImpactUrgencyLevel, Priority


class ProblemCreate(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.medium
    ci_id: int | None = None
    assigned_to_id: int | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    impact: ImpactUrgencyLevel | None = None
    urgency: ImpactUrgencyLevel | None = None


class ProblemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: Priority | None = None
    root_cause: str | None = None
    workaround: str | None = None
    ci_id: int | None = None
    assigned_to_id: int | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    impact: ImpactUrgencyLevel | None = None
    urgency: ImpactUrgencyLevel | None = None


class ProblemResolve(BaseModel):
    root_cause: str
    workaround: str | None = None
    resolution_code: str | None = None


class ProblemClose(BaseModel):
    close_code: str | None = None


class ProblemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    title: str
    description: str
    status: str
    priority: str
    category: str | None
    subcategory: str | None
    root_cause: str | None
    workaround: str | None
    service: str | None
    business_service: str | None
    location: str | None
    department: str | None
    environment: str | None
    assignment_group: str | None
    knowledge_article: str | None
    impact: str | None
    urgency: str | None
    ci_id: int | None
    assigned_to_id: int | None
    created_by_id: int
    resolution_code: str | None
    resolved_by_id: int | None
    resolved_at: datetime | None
    close_code: str | None
    closed_by_id: int | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedProblems(BaseModel):
    items: list[ProblemRead]
    total: int
