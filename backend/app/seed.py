from datetime import datetime, timedelta, timezone

from app import models  # noqa: F401
from app.database import Base, SessionLocal, engine
from app.models.base import make_number
from app.models.catalog import CatalogItem
from app.models.change import Change
from app.models.ci import CI
from app.models.enums import (
    ArticleStatus,
    ChangeStatus,
    ChangeType,
    CIStatus,
    CIType,
    IncidentStatus,
    ProblemStatus,
    Priority,
    RequestStatus,
    Role,
)
from app.models.incident import Incident
from app.models.knowledge import KnowledgeArticle
from app.models.problem import Problem
from app.models.request import ServiceRequest
from app.models.user import User
from app.security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded, skipping.")
            return

        admin = User(
            email="admin@bytebridge.io",
            hashed_password=hash_password("Admin123!"),
            full_name="Ava Admin",
            role=Role.admin.value,
        )
        alice = User(
            email="alice@bytebridge.io",
            hashed_password=hash_password("Password123!"),
            full_name="Alice Nguyen",
            role=Role.user.value,
        )
        bob = User(
            email="bob@bytebridge.io",
            hashed_password=hash_password("Password123!"),
            full_name="Bob Martinez",
            role=Role.user.value,
        )
        db.add_all([admin, alice, bob])
        db.flush()

        cis = [
            CI(name="PROD-APP-01", ci_type=CIType.server.value, status=CIStatus.in_use.value,
               serial_number="SN-1001", location="US-East DC1", owner_id=admin.id,
               description="Primary production application server"),
            CI(name="Alice's Laptop", ci_type=CIType.hardware.value, status=CIStatus.in_use.value,
               serial_number="SN-2002", location="Remote", owner_id=alice.id,
               description="MacBook Pro 16-inch"),
            CI(name="ByteBridge Portal", ci_type=CIType.application.value, status=CIStatus.in_use.value,
               serial_number=None, location="Cloud", owner_id=admin.id,
               description="Customer-facing web application"),
            CI(name="Core Switch 01", ci_type=CIType.network_device.value, status=CIStatus.in_use.value,
               serial_number="SN-3003", location="US-East DC1", owner_id=None,
               description="Primary network core switch"),
            CI(name="Backup NAS", ci_type=CIType.hardware.value, status=CIStatus.under_maintenance.value,
               serial_number="SN-4004", location="US-East DC1", owner_id=None,
               description="Backup storage array"),
        ]
        db.add_all(cis)
        db.flush()

        incidents = [
            Incident(title="Portal login page returns 500", description="Users report a 500 error on the login page.",
                      status=IncidentStatus.new.value, priority=Priority.high.value, category="Application",
                      ci_id=cis[2].id, caller_id=alice.id, number="TMP-0"),
            Incident(title="Laptop won't connect to VPN", description="VPN client fails to establish tunnel.",
                      status=IncidentStatus.in_progress.value, priority=Priority.medium.value, category="Network",
                      ci_id=cis[1].id, caller_id=alice.id, assigned_to_id=admin.id, number="TMP-1"),
            Incident(title="Core switch dropping packets", description="Intermittent packet loss on core switch.",
                      status=IncidentStatus.in_progress.value, priority=Priority.critical.value, category="Network",
                      ci_id=cis[3].id, caller_id=bob.id, assigned_to_id=admin.id, number="TMP-2"),
            Incident(title="Slow response on PROD-APP-01", description="Application server response times degraded.",
                      status=IncidentStatus.resolved.value, priority=Priority.high.value, category="Application",
                      ci_id=cis[0].id, caller_id=bob.id, assigned_to_id=admin.id,
                      resolution_notes="Restarted app service; added memory monitoring.",
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=1), number="TMP-3"),
            Incident(title="Password reset email not received", description="User did not receive password reset email.",
                      status=IncidentStatus.closed.value, priority=Priority.low.value, category="Application",
                      caller_id=alice.id, assigned_to_id=admin.id,
                      resolution_notes="Email was in spam folder; resolved.",
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=3),
                      closed_at=datetime.now(timezone.utc) - timedelta(days=2), number="TMP-4"),
            Incident(title="Backup NAS offline overnight", description="Backup NAS was unreachable during nightly backup window.",
                      status=IncidentStatus.on_hold.value, priority=Priority.medium.value, category="Hardware",
                      ci_id=cis[4].id, caller_id=bob.id, number="TMP-5"),
        ]
        db.add_all(incidents)
        db.flush()
        for incident in incidents:
            incident.number = make_number("INC", incident.id)
        db.flush()

        problem1 = Problem(title="Recurring network packet loss", description="Multiple incidents point to failing core switch hardware.",
                            status=ProblemStatus.investigating.value, priority=Priority.high.value,
                            ci_id=cis[3].id, assigned_to_id=admin.id, created_by_id=admin.id, number="TMP-P0")
        problem2 = Problem(title="App server memory leak", description="Gradual memory growth causing degraded performance.",
                            status=ProblemStatus.resolved.value, priority=Priority.medium.value,
                            ci_id=cis[0].id, assigned_to_id=admin.id, created_by_id=admin.id,
                            root_cause="Unbounded in-memory cache in session handler.",
                            workaround="Nightly service restart until permanent fix ships.", number="TMP-P1")
        db.add_all([problem1, problem2])
        db.flush()
        problem1.number = make_number("PRB", problem1.id)
        problem2.number = make_number("PRB", problem2.id)
        incidents[2].problem_id = problem1.id
        incidents[3].problem_id = problem2.id

        catalog_items = [
            CatalogItem(name="New Laptop Request", description="Request a new laptop for a new hire or replacement.", category="Hardware"),
            CatalogItem(name="VPN Access", description="Request VPN access for remote work.", category="Network"),
            CatalogItem(name="Software License", description="Request a license for approved business software.", category="Software"),
            CatalogItem(name="Employee Onboarding", description="Provision accounts and equipment for a new employee.", category="HR"),
        ]
        db.add_all(catalog_items)
        db.flush()

        service_requests = [
            ServiceRequest(catalog_item_id=catalog_items[1].id, requested_by_id=alice.id,
                            status=RequestStatus.submitted.value, notes="Need VPN access for home office.", number="TMP-R0"),
            ServiceRequest(catalog_item_id=catalog_items[2].id, requested_by_id=bob.id,
                            status=RequestStatus.in_progress.value, notes="Requesting Adobe Creative Cloud license.", number="TMP-R1"),
            ServiceRequest(catalog_item_id=catalog_items[0].id, requested_by_id=bob.id,
                            status=RequestStatus.fulfilled.value, notes="Replacement laptop, old one has battery issues.",
                            fulfilled_by_id=admin.id, number="TMP-R2"),
        ]
        db.add_all(service_requests)
        db.flush()
        for req in service_requests:
            req.number = make_number("REQ", req.id)

        changes = [
            Change(title="Upgrade core switch firmware", description="Apply vendor firmware patch to address packet loss.",
                   change_type=ChangeType.normal.value, status=ChangeStatus.approved.value, risk=Priority.medium.value,
                   ci_id=cis[3].id, problem_id=problem1.id, requested_by_id=admin.id, approved_by_id=admin.id,
                   planned_start=datetime.now(timezone.utc) + timedelta(days=2),
                   planned_end=datetime.now(timezone.utc) + timedelta(days=2, hours=2),
                   implementation_plan="Apply firmware update during maintenance window.",
                   backout_plan="Roll back to previous firmware image if issues occur.", number="TMP-C0"),
            Change(title="Deploy app server memory fix", description="Deploy patched session handler to fix memory leak.",
                   change_type=ChangeType.standard.value, status=ChangeStatus.closed.value, risk=Priority.low.value,
                   ci_id=cis[0].id, problem_id=problem2.id, requested_by_id=admin.id, approved_by_id=admin.id,
                   implementation_plan="Standard deployment via CI/CD pipeline.",
                   backout_plan="Redeploy previous release tag.", number="TMP-C1"),
            Change(title="Add new backup NAS unit", description="Provision additional NAS capacity for backups.",
                   change_type=ChangeType.normal.value, status=ChangeStatus.draft.value, risk=Priority.low.value,
                   requested_by_id=admin.id, implementation_plan="Rack, cable, and configure new NAS unit.", number="TMP-C2"),
        ]
        db.add_all(changes)
        db.flush()
        for change in changes:
            change.number = make_number("CHG", change.id)

        articles = [
            KnowledgeArticle(title="How to connect to the company VPN", content="Step-by-step guide to installing and configuring the VPN client...",
                             category="Network", status=ArticleStatus.published.value, author_id=admin.id, view_count=42),
            KnowledgeArticle(title="Resetting your password", content="Instructions for resetting your ByteBridge account password...",
                             category="Application", status=ArticleStatus.published.value, author_id=admin.id, view_count=87),
            KnowledgeArticle(title="Requesting new hardware", content="How to submit a hardware request through the service catalog...",
                             category="Hardware", status=ArticleStatus.published.value, author_id=admin.id, view_count=23),
            KnowledgeArticle(title="Common VPN troubleshooting steps", content="If you're having trouble connecting to VPN, try these steps first...",
                             category="Network", status=ArticleStatus.published.value, author_id=admin.id, view_count=15),
            KnowledgeArticle(title="Upcoming maintenance window process (draft)", content="Draft notes on the new maintenance window communication process...",
                             category="Process", status=ArticleStatus.draft.value, author_id=admin.id, view_count=0),
        ]
        db.add_all(articles)

        db.commit()

        print("Seed complete:")
        print(f"  users: {db.query(User).count()}")
        print(f"  cis: {db.query(CI).count()}")
        print(f"  incidents: {db.query(Incident).count()}")
        print(f"  problems: {db.query(Problem).count()}")
        print(f"  changes: {db.query(Change).count()}")
        print(f"  catalog_items: {db.query(CatalogItem).count()}")
        print(f"  service_requests: {db.query(ServiceRequest).count()}")
        print(f"  knowledge_articles: {db.query(KnowledgeArticle).count()}")
        print()
        print("Login with: admin@bytebridge.io / Admin123!  or  alice@bytebridge.io / Password123!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
