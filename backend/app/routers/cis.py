from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.ci import CI
from app.models.user import User
from app.schemas.ci import CICreate, CIRead, CIUpdate

router = APIRouter(prefix="/cis", tags=["cis"])


@router.get("", response_model=list[CIRead])
def list_cis(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CI).order_by(CI.id.desc()).all()


@router.post("", response_model=CIRead, status_code=status.HTTP_201_CREATED)
def create_ci(payload: CICreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    ci = CI(**payload.model_dump())
    ci.ci_type = ci.ci_type.value if hasattr(ci.ci_type, "value") else ci.ci_type
    ci.status = ci.status.value if hasattr(ci.status, "value") else ci.status
    db.add(ci)
    db.commit()
    db.refresh(ci)
    return ci


@router.get("/{ci_id}", response_model=CIRead)
def get_ci(ci_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ci = db.query(CI).filter(CI.id == ci_id).first()
    if not ci:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CI not found")
    return ci


@router.patch("/{ci_id}", response_model=CIRead)
def update_ci(ci_id: int, payload: CIUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    ci = db.query(CI).filter(CI.id == ci_id).first()
    if not ci:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CI not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ci, field, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(ci)
    return ci


@router.delete("/{ci_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ci(ci_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    ci = db.query(CI).filter(CI.id == ci_id).first()
    if not ci:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CI not found")
    db.delete(ci)
    db.commit()
