from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Priority


class ProblemCreate(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.medium
    ci_id: int | None = None
    assigned_to_id: int | None = None


class ProblemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: Priority | None = None
    root_cause: str | None = None
    workaround: str | None = None
    ci_id: int | None = None
    assigned_to_id: int | None = None


class ProblemResolve(BaseModel):
    root_cause: str
    workaround: str | None = None


class ProblemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    title: str
    description: str
    status: str
    priority: str
    root_cause: str | None
    workaround: str | None
    ci_id: int | None
    assigned_to_id: int | None
    created_by_id: int
    created_at: datetime
    updated_at: datetime


class PaginatedProblems(BaseModel):
    items: list[ProblemRead]
    total: int
