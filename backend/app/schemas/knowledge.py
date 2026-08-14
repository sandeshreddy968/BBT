from datetime import datetime

from pydantic import BaseModel, ConfigDict


class KnowledgeArticleCreate(BaseModel):
    title: str
    content: str
    category: str | None = None


class KnowledgeArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    status: str | None = None


class KnowledgeArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    category: str | None
    status: str
    author_id: int
    view_count: int
    created_at: datetime
    updated_at: datetime


class PaginatedArticles(BaseModel):
    items: list[KnowledgeArticleRead]
    total: int
