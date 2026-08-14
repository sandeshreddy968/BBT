from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ChangeType, Priority


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


class ChangeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    title: str
    description: str
    change_type: str
    status: str
    risk: str
    ci_id: int | None
    problem_id: int | None
    requested_by_id: int
    approved_by_id: int | None
    planned_start: datetime | None
    planned_end: datetime | None
    implementation_plan: str | None
    backout_plan: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedChanges(BaseModel):
    items: list[ChangeRead]
    total: int
