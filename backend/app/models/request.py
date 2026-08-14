from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin
from app.models.enums import RequestStatus


class ServiceRequest(Base, TimestampMixin):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    catalog_item_id: Mapped[int] = mapped_column(ForeignKey("catalog_items.id"), nullable=False)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default=RequestStatus.submitted.value, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    fulfilled_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
