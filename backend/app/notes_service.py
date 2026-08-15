from sqlalchemy.orm import Session

from app.models.note import TicketNote


def list_notes(db: Session, ticket_type: str, ticket_id: int, customer_visible_only: bool = False) -> list[TicketNote]:
    query = db.query(TicketNote).filter(TicketNote.ticket_type == ticket_type, TicketNote.ticket_id == ticket_id)
    if customer_visible_only:
        query = query.filter(TicketNote.is_customer_visible.is_(True))
    return query.order_by(TicketNote.created_at.desc()).all()


def create_note(
    db: Session, ticket_type: str, ticket_id: int, author_id: int, body: str, is_customer_visible: bool
) -> TicketNote:
    note = TicketNote(
        ticket_type=ticket_type,
        ticket_id=ticket_id,
        author_id=author_id,
        body=body,
        is_customer_visible=is_customer_visible,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
