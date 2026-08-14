from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin
from app.models.enums import CIStatus, CIType


class CI(Base, TimestampMixin):
    __tablename__ = "cis"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    ci_type: Mapped[str] = mapped_column(String, default=CIType.other.value, nullable=False)
    status: Mapped[str] = mapped_column(String, default=CIStatus.in_use.value, nullable=False)
    serial_number: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
