import enum


class Role(str, enum.Enum):
    admin = "admin"
    user = "user"


class CIType(str, enum.Enum):
    hardware = "hardware"
    software = "software"
    server = "server"
    network_device = "network_device"
    application = "application"
    other = "other"


class CIStatus(str, enum.Enum):
    in_use = "in_use"
    in_stock = "in_stock"
    retired = "retired"
    under_maintenance = "under_maintenance"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    on_hold = "on_hold"
    resolved = "resolved"
    closed = "closed"


class ProblemStatus(str, enum.Enum):
    new = "new"
    investigating = "investigating"
    root_cause_identified = "root_cause_identified"
    resolved = "resolved"
    closed = "closed"


class ChangeType(str, enum.Enum):
    standard = "standard"
    normal = "normal"
    emergency = "emergency"


class ChangeStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    implemented = "implemented"
    closed = "closed"


class RequestStatus(str, enum.Enum):
    submitted = "submitted"
    approved = "approved"
    in_progress = "in_progress"
    fulfilled = "fulfilled"
    rejected = "rejected"
    closed = "closed"


class ArticleStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"
