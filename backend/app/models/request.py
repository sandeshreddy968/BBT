from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
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

    contact_type: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)
    service: Mapped[str | None] = mapped_column(String, nullable=True)
    business_service: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    environment: Mapped[str | None] = mapped_column(String, nullable=True)
    assignment_group: Mapped[str | None] = mapped_column(String, nullable=True)
    knowledge_article: Mapped[str | None] = mapped_column(String, nullable=True)
    ci_id: Mapped[int | None] = mapped_column(ForeignKey("cis.id"), nullable=True)

    resolution_code: Mapped[str | None] = mapped_column(String, nullable=True)
    close_code: Mapped[str | None] = mapped_column(String, nullable=True)
    closed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
