from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CatalogItemCreate(BaseModel):
    name: str
    description: str | None = None
    category: str | None = None
    is_active: bool = True


class CatalogItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    is_active: bool | None = None


class CatalogItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    category: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
