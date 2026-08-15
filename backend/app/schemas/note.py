from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TicketNoteCreate(BaseModel):
    body: str
    is_customer_visible: bool = False


class TicketNoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_type: str
    ticket_id: int
    author_id: int
    body: str
    is_customer_visible: bool
    created_at: datetime
