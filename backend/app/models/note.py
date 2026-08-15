from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class TicketNote(Base, TimestampMixin):
    __tablename__ = "ticket_notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    ticket_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_customer_visible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
