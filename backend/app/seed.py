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
    ContactType,
    EnvironmentType,
    ImpactUrgencyLevel,
    IncidentStatus,
    ProblemStatus,
    Priority,
    RequestStatus,
    Role,
    TicketType,
)
from app.models.incident import Incident
from app.models.knowledge import KnowledgeArticle
from app.models.note import TicketNote
from app.models.problem import Problem
from app.models.request import ServiceRequest
from app.models.user import User
from app.security import hash_password


def _days_ago(n: int, hour: int = 10) -> datetime:
    return (datetime.utcnow() - timedelta(days=n)).replace(hour=hour, minute=0, second=0, microsecond=0)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # (object, desired updated_at) pairs restored in one final pass right before
    # commit -- onupdate=func.now() fires on every subsequent flush that touches
    # a row (e.g. assigning .number or .problem_id), so any earlier restoration
    # would just get stomped again by a later mutation.
    timestamp_overrides: list[tuple[object, datetime]] = []
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
                      subcategory="Login", contact_type=ContactType.self_service.value, service="ByteBridge Portal",
                      business_service="Customer Portal", location="Remote", department="IT",
                      environment=EnvironmentType.production.value, assignment_group="Application Support",
                      impact=ImpactUrgencyLevel.high.value, urgency=ImpactUrgencyLevel.high.value,
                      ci_id=cis[2].id, caller_id=alice.id, created_at=_days_ago(0), updated_at=_days_ago(0), number="TMP-0"),
            Incident(title="Laptop won't connect to VPN", description="VPN client fails to establish tunnel.",
                      status=IncidentStatus.in_progress.value, priority=Priority.medium.value, category="Network",
                      ci_id=cis[1].id, caller_id=alice.id, assigned_to_id=admin.id,
                      created_at=_days_ago(2), updated_at=_days_ago(1), number="TMP-1"),
            Incident(title="Core switch dropping packets", description="Intermittent packet loss on core switch.",
                      status=IncidentStatus.in_progress.value, priority=Priority.critical.value, category="Network",
                      subcategory="Connectivity", contact_type=ContactType.phone.value, service="Network",
                      business_service="Core Network", location="US-East DC1", department="Infrastructure",
                      environment=EnvironmentType.production.value, assignment_group="Network Operations",
                      impact=ImpactUrgencyLevel.high.value, urgency=ImpactUrgencyLevel.high.value,
                      ci_id=cis[3].id, caller_id=bob.id, assigned_to_id=admin.id,
                      created_at=_days_ago(4), updated_at=_days_ago(3), number="TMP-2"),
            Incident(title="Slow response on PROD-APP-01", description="Application server response times degraded.",
                      status=IncidentStatus.resolved.value, priority=Priority.high.value, category="Application",
                      ci_id=cis[0].id, caller_id=bob.id, assigned_to_id=admin.id,
                      resolution_notes="Restarted app service; added memory monitoring.",
                      created_at=_days_ago(8), updated_at=_days_ago(1),
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=1), number="TMP-3"),
            Incident(title="Password reset email not received", description="User did not receive password reset email.",
                      status=IncidentStatus.closed.value, priority=Priority.low.value, category="Application",
                      caller_id=alice.id, assigned_to_id=admin.id,
                      resolution_notes="Email was in spam folder; resolved.",
                      created_at=_days_ago(12), updated_at=_days_ago(2),
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=3),
                      closed_at=datetime.now(timezone.utc) - timedelta(days=2), number="TMP-4"),
            Incident(title="Backup NAS offline overnight", description="Backup NAS was unreachable during nightly backup window.",
                      status=IncidentStatus.on_hold.value, priority=Priority.medium.value, category="Hardware",
                      ci_id=cis[4].id, caller_id=bob.id, created_at=_days_ago(6), updated_at=_days_ago(5), number="TMP-5"),
        ]
        db.add_all(incidents)
        db.flush()
        timestamp_overrides += [(i, i.updated_at) for i in incidents]
        for incident in incidents:
            incident.number = make_number("INC", incident.id)
        db.flush()

        extra_incidents = [
            Incident(title="Email delivery delays reported", description="Several users report delayed inbound email.",
                      status=IncidentStatus.in_progress.value, priority=Priority.medium.value, category="Application",
                      caller_id=alice.id, assigned_to_id=admin.id,
                      created_at=_days_ago(1), updated_at=_days_ago(1), number="TMP-6"),
            Incident(title="Wifi dropping in conference room", description="Intermittent wifi disconnects during meetings.",
                      status=IncidentStatus.new.value, priority=Priority.medium.value, category="Network",
                      caller_id=bob.id, created_at=_days_ago(3), updated_at=_days_ago(3), number="TMP-7"),
            Incident(title="Printer offline in HQ", description="Main office printer unreachable from the network.",
                      status=IncidentStatus.resolved.value, priority=Priority.low.value, category="Hardware",
                      caller_id=bob.id, assigned_to_id=admin.id, resolution_notes="Power-cycled printer and switch port.",
                      created_at=_days_ago(5), updated_at=_days_ago(4),
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=4), number="TMP-8"),
            Incident(title="Shared drive access denied", description="User cannot access shared team drive.",
                      status=IncidentStatus.new.value, priority=Priority.medium.value, category="Application",
                      caller_id=alice.id, created_at=_days_ago(7), updated_at=_days_ago(7), number="TMP-9"),
            Incident(title="Monitor flickering at workstation", description="External monitor flickers intermittently.",
                      status=IncidentStatus.closed.value, priority=Priority.low.value, category="Hardware",
                      caller_id=bob.id, assigned_to_id=admin.id, resolution_notes="Replaced display cable.",
                      created_at=_days_ago(9), updated_at=_days_ago(8),
                      resolved_at=datetime.now(timezone.utc) - timedelta(days=9),
                      closed_at=datetime.now(timezone.utc) - timedelta(days=8), number="TMP-10"),
            Incident(title="Software install failing on laptop", description="Approved software package fails to install silently.",
                      status=IncidentStatus.in_progress.value, priority=Priority.high.value, category="Software",
                      caller_id=alice.id, assigned_to_id=admin.id,
                      created_at=_days_ago(11), updated_at=_days_ago(10), number="TMP-11"),
        ]
        db.add_all(extra_incidents)
        db.flush()
        timestamp_overrides += [(i, i.updated_at) for i in extra_incidents]
        for incident in extra_incidents:
            incident.number = make_number("INC", incident.id)
        db.flush()

        problem1 = Problem(title="Recurring network packet loss", description="Multiple incidents point to failing core switch hardware.",
                            status=ProblemStatus.investigating.value, priority=Priority.high.value,
                            category="Network", subcategory="Hardware Failure", service="Network",
                            business_service="Core Network", location="US-East DC1", department="Infrastructure",
                            environment=EnvironmentType.production.value, assignment_group="Network Operations",
                            impact=ImpactUrgencyLevel.high.value, urgency=ImpactUrgencyLevel.medium.value,
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
        db.flush()

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
                            status=RequestStatus.submitted.value, notes="Need VPN access for home office.",
                            contact_type=ContactType.self_service.value, category="Access", subcategory="VPN",
                            service="VPN", department="IT", environment=EnvironmentType.production.value,
                            created_at=_days_ago(1), updated_at=_days_ago(1), number="TMP-R0"),
            ServiceRequest(catalog_item_id=catalog_items[2].id, requested_by_id=bob.id,
                            status=RequestStatus.in_progress.value, notes="Requesting Adobe Creative Cloud license.",
                            created_at=_days_ago(5), updated_at=_days_ago(4), number="TMP-R1"),
            ServiceRequest(catalog_item_id=catalog_items[0].id, requested_by_id=bob.id,
                            status=RequestStatus.fulfilled.value, notes="Replacement laptop, old one has battery issues.",
                            fulfilled_by_id=admin.id, created_at=_days_ago(9), updated_at=_days_ago(7), number="TMP-R2"),
            ServiceRequest(catalog_item_id=catalog_items[3].id, requested_by_id=admin.id,
                            status=RequestStatus.submitted.value, notes="Onboarding kit for new hire starting next week.",
                            created_at=_days_ago(2), updated_at=_days_ago(2), number="TMP-R3"),
            ServiceRequest(catalog_item_id=catalog_items[1].id, requested_by_id=bob.id,
                            status=RequestStatus.approved.value, notes="VPN access for a contractor.",
                            created_at=_days_ago(6), updated_at=_days_ago(5), number="TMP-R4"),
            ServiceRequest(catalog_item_id=catalog_items[2].id, requested_by_id=alice.id,
                            status=RequestStatus.fulfilled.value, notes="Design software license renewal.",
                            fulfilled_by_id=admin.id, created_at=_days_ago(11), updated_at=_days_ago(10), number="TMP-R5"),
        ]
        db.add_all(service_requests)
        db.flush()
        timestamp_overrides += [(r, r.updated_at) for r in service_requests]
        for req in service_requests:
            req.number = make_number("REQ", req.id)
        db.flush()

        changes = [
            Change(title="Upgrade core switch firmware", description="Apply vendor firmware patch to address packet loss.",
                   change_type=ChangeType.normal.value, status=ChangeStatus.approved.value, risk=Priority.medium.value,
                   category="Network", subcategory="Firmware", service="Network", business_service="Core Network",
                   location="US-East DC1", department="Infrastructure", environment=EnvironmentType.production.value,
                   assignment_group="Network Operations",
                   ci_id=cis[3].id, problem_id=problem1.id, requested_by_id=admin.id, approved_by_id=admin.id,
                   planned_start=datetime.now(timezone.utc) + timedelta(days=2),
                   planned_end=datetime.now(timezone.utc) + timedelta(days=2, hours=2),
                   implementation_plan="Apply firmware update during maintenance window.",
                   backout_plan="Roll back to previous firmware image if issues occur.",
                   created_at=_days_ago(3), updated_at=_days_ago(2), number="TMP-C0"),
            Change(title="Deploy app server memory fix", description="Deploy patched session handler to fix memory leak.",
                   change_type=ChangeType.standard.value, status=ChangeStatus.closed.value, risk=Priority.low.value,
                   ci_id=cis[0].id, problem_id=problem2.id, requested_by_id=admin.id, approved_by_id=admin.id,
                   implementation_plan="Standard deployment via CI/CD pipeline.",
                   backout_plan="Redeploy previous release tag.",
                   created_at=_days_ago(10), updated_at=_days_ago(8), number="TMP-C1"),
            Change(title="Add new backup NAS unit", description="Provision additional NAS capacity for backups.",
                   change_type=ChangeType.normal.value, status=ChangeStatus.draft.value, risk=Priority.low.value,
                   requested_by_id=admin.id, implementation_plan="Rack, cable, and configure new NAS unit.",
                   created_at=_days_ago(0), updated_at=_days_ago(0), number="TMP-C2"),
        ]
        db.add_all(changes)
        db.flush()
        timestamp_overrides += [(c, c.updated_at) for c in changes]
        for change in changes:
            change.number = make_number("CHG", change.id)
        db.flush()

        ticket_notes = [
            TicketNote(ticket_type=TicketType.incident.value, ticket_id=incidents[2].id, author_id=admin.id,
                       body="Escalated to network vendor for firmware diagnosis.", is_customer_visible=False),
            TicketNote(ticket_type=TicketType.incident.value, ticket_id=incidents[2].id, author_id=admin.id,
                       body="We've identified the likely cause and are working on a fix. Will update shortly.",
                       is_customer_visible=True),
            TicketNote(ticket_type=TicketType.incident.value, ticket_id=incidents[3].id, author_id=admin.id,
                       body="Confirmed a memory leak in the session handler; added monitoring to catch recurrence.",
                       is_customer_visible=False),
            TicketNote(ticket_type=TicketType.problem.value, ticket_id=problem1.id, author_id=admin.id,
                       body="Vendor confirmed a known firmware defect causing intermittent packet loss under load.",
                       is_customer_visible=False),
        ]
        db.add_all(ticket_notes)

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

        for obj, ts in timestamp_overrides:
            obj.updated_at = ts
        db.flush()

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
