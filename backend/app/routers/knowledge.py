from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.enums import ArticleStatus, Role
from app.models.knowledge import KnowledgeArticle
from app.models.user import User
from app.schemas.knowledge import KnowledgeArticleCreate, KnowledgeArticleRead, KnowledgeArticleUpdate

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("", response_model=list[KnowledgeArticleRead])
def list_articles(
    q: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(KnowledgeArticle)
    if current_user.role != Role.admin.value:
        query = query.filter(KnowledgeArticle.status == ArticleStatus.published.value)
    if q:
        query = query.filter(
            or_(KnowledgeArticle.title.ilike(f"%{q}%"), KnowledgeArticle.content.ilike(f"%{q}%"))
        )
    return query.order_by(KnowledgeArticle.id.desc()).all()


@router.post("", response_model=KnowledgeArticleRead, status_code=status.HTTP_201_CREATED)
def create_article(
    payload: KnowledgeArticleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)
):
    article = KnowledgeArticle(**payload.model_dump(), author_id=current_user.id)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.get("/{article_id}", response_model=KnowledgeArticleRead)
def get_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    if current_user.role != Role.admin.value and article.status != ArticleStatus.published.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    article.view_count += 1
    db.commit()
    db.refresh(article)
    return article


@router.patch("/{article_id}", response_model=KnowledgeArticleRead)
def update_article(
    article_id: int, payload: KnowledgeArticleUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(article, field, value)
    db.commit()
    db.refresh(article)
    return article


@router.post("/{article_id}/publish", response_model=KnowledgeArticleRead)
def publish_article(article_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    article.status = ArticleStatus.published.value
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    db.delete(article)
    db.commit()
