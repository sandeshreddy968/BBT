from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Priority


class IncidentCreate(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.medium
    category: str | None = None
    ci_id: int | None = None


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: Priority | None = None
    category: str | None = None
    ci_id: int | None = None


class IncidentResolve(BaseModel):
    resolution_notes: str


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
    ci_id: int | None
    caller_id: int
    assigned_to_id: int | None
    problem_id: int | None
    resolution_notes: str | None
    resolved_at: datetime | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedIncidents(BaseModel):
    items: list[IncidentRead]
    total: int
