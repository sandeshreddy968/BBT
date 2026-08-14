from pydantic import BaseModel


class DashboardSummary(BaseModel):
    open_incidents: int
    my_incidents: int
    open_problems: int
    open_changes: int
    pending_requests: int
    total_cis: int
    published_articles: int
