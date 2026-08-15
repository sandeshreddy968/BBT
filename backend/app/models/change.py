from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin
from app.models.enums import ChangeStatus, ChangeType, Priority


class Change(Base, TimestampMixin):
    __tablename__ = "changes"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    change_type: Mapped[str] = mapped_column(String, default=ChangeType.standard.value, nullable=False)
    status: Mapped[str] = mapped_column(String, default=ChangeStatus.draft.value, nullable=False)
    risk: Mapped[str] = mapped_column(String, default=Priority.low.value, nullable=False)
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
    problem_id: Mapped[int | None] = mapped_column(ForeignKey("problems.id"), nullable=True)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    approved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    planned_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    implementation_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    backout_plan: Mapped[str | None] = mapped_column(Text, nullable=True)

    close_code: Mapped[str | None] = mapped_column(String, nullable=True)
    closed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
