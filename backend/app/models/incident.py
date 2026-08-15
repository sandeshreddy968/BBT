from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin
from app.models.enums import IncidentStatus, Priority


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, default=IncidentStatus.new.value, nullable=False)
    priority: Mapped[str] = mapped_column(String, default=Priority.medium.value, nullable=False)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)

    contact_type: Mapped[str | None] = mapped_column(String, nullable=True)
    service: Mapped[str | None] = mapped_column(String, nullable=True)
    business_service: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    environment: Mapped[str | None] = mapped_column(String, nullable=True)
    assignment_group: Mapped[str | None] = mapped_column(String, nullable=True)
    knowledge_article: Mapped[str | None] = mapped_column(String, nullable=True)

    impact: Mapped[str | None] = mapped_column(String, nullable=True)
    urgency: Mapped[str | None] = mapped_column(String, nullable=True)
    hold_reason: Mapped[str | None] = mapped_column(String, nullable=True)

    ci_id: Mapped[int | None] = mapped_column(ForeignKey("cis.id"), nullable=True)
    caller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    problem_id: Mapped[int | None] = mapped_column(ForeignKey("problems.id"), nullable=True)
    change_id: Mapped[int | None] = mapped_column(ForeignKey("changes.id"), nullable=True)
    related_incident_id: Mapped[int | None] = mapped_column(ForeignKey("incidents.id"), nullable=True)

    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolution_code: Mapped[str | None] = mapped_column(String, nullable=True)
    resolved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    close_code: Mapped[str | None] = mapped_column(String, nullable=True)
    closed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
