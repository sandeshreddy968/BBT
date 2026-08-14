from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.catalog import CatalogItem
from app.models.user import User
from app.schemas.catalog import CatalogItemCreate, CatalogItemRead, CatalogItemUpdate

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=list[CatalogItemRead])
def list_catalog_items(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CatalogItem).filter(CatalogItem.is_active.is_(True)).order_by(CatalogItem.name).all()


@router.post("", response_model=CatalogItemRead, status_code=status.HTTP_201_CREATED)
def create_catalog_item(
    payload: CatalogItemCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    item = CatalogItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=CatalogItemRead)
def get_catalog_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")
    return item


@router.patch("/{item_id}", response_model=CatalogItemRead)
def update_catalog_item(
    item_id: int, payload: CatalogItemUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_catalog_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")
    db.delete(item)
    db.commit()
