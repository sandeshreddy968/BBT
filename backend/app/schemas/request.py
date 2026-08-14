from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServiceRequestCreate(BaseModel):
    catalog_item_id: int
    notes: str | None = None


class ServiceRequestUpdate(BaseModel):
    notes: str | None = None


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    catalog_item_id: int
    requested_by_id: int
    status: str
    notes: str | None
    fulfilled_by_id: int | None
    created_at: datetime
    updated_at: datetime


class PaginatedRequests(BaseModel):
    items: list[ServiceRequestRead]
    total: int
