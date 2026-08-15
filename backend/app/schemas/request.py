from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ContactType, EnvironmentType


class ServiceRequestCreate(BaseModel):
    catalog_item_id: int
    notes: str | None = None
    contact_type: ContactType | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    ci_id: int | None = None


class ServiceRequestUpdate(BaseModel):
    notes: str | None = None
    contact_type: ContactType | None = None
    category: str | None = None
    subcategory: str | None = None
    service: str | None = None
    business_service: str | None = None
    location: str | None = None
    department: str | None = None
    environment: EnvironmentType | None = None
    assignment_group: str | None = None
    knowledge_article: str | None = None
    ci_id: int | None = None


class ServiceRequestClose(BaseModel):
    close_code: str | None = None
    resolution_code: str | None = None


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    catalog_item_id: int
    requested_by_id: int
    status: str
    notes: str | None
    fulfilled_by_id: int | None
    contact_type: str | None
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
    resolution_code: str | None
    close_code: str | None
    closed_by_id: int | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedRequests(BaseModel):
    items: list[ServiceRequestRead]
    total: int
