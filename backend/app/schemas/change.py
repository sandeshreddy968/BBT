from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ChangeType, EnvironmentType, Priority


class ChangeCreate(BaseModel):
    title: str
    description: str
    change_type: ChangeType = ChangeType.standard
    risk: Priority = Priority.low
    ci_id: int | None = None
    problem_id: int | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    implementation_plan: str | None = None
    backout_plan: str | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None


class ChangeUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    change_type: ChangeType | None = None
    risk: Priority | None = None
    ci_id: int | None = None
    problem_id: int | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    implementation_plan: str | None = None
    backout_plan: str | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None


class ChangeClose(BaseModel):
    close_code: str | None = None


class ChangeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    title: str
    description: str
    change_type: str
    status: str
    risk: str
    category: str | None
    subcategory: str | None
    service: str | None
    business_service: str | None
    location: str | None
    department: str | None
    environment: str | None
    assignment_group: str | None
    knowledge_article: str | None
    ci_id: int | None
    problem_id: int | None
    requested_by_id: int
    approved_by_id: int | None
    planned_start: datetime | None
    planned_end: datetime | None
    implementation_plan: str | None
    backout_plan: str | None
    close_code: str | None
    closed_by_id: int | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedChanges(BaseModel):
    items: list[ChangeRead]
    total: int
