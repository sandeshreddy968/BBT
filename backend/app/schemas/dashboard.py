from datetime import datetime

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    open_incidents: int
    my_incidents: int
    open_problems: int
    open_changes: int
    pending_requests: int
    total_cis: int
    published_articles: int


class BreakdownItem(BaseModel):
    label: str
    count: int


class DashboardBreakdown(BaseModel):
    incidents_by_status: list[BreakdownItem]
    incidents_by_priority: list[BreakdownItem]


class TrendPoint(BaseModel):
    date: str
    incidents: int
    requests: int
    changes: int


class ActivityItem(BaseModel):
    type: str
    number: str
    title: str
    status: str
    updated_at: datetime
    url: str
