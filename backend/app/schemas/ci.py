from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import CIStatus, CIType


class CICreate(BaseModel):
    name: str
    ci_type: CIType = CIType.other
    status: CIStatus = CIStatus.in_use
    serial_number: str | None = None
    location: str | None = None
    owner_id: int | None = None
    description: str | None = None


class CIUpdate(BaseModel):
    name: str | None = None
    ci_type: CIType | None = None
    status: CIStatus | None = None
    serial_number: str | None = None
    location: str | None = None
    owner_id: int | None = None
    description: str | None = None


class CIRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    ci_type: str
    status: str
    serial_number: str | None
    location: str | None
    owner_id: int | None
    description: str | None
    created_at: datetime
    updated_at: datetime
