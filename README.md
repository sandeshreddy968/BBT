# ByteBridge ITSM

An IT Service Management application for ByteBridge, covering the core ITIL workflows: Incident Management, Problem Management, Change Management, Service Catalog & Requests, Knowledge Base, and a basic CMDB (Configuration Items).

## Tech stack

- **Backend**: FastAPI, SQLAlchemy 2.0, SQLite (dev) / Postgres-compatible, JWT auth (python-jose + passlib/bcrypt)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS

## Modules

| Module | Description |
|---|---|
| Incidents | Report, assign, resolve, close, and reopen service disruptions |
| Problems | Investigate root causes, link related incidents, track workarounds |
| Changes | Draft → Submit → Approve/Reject → Implement → Close lifecycle |
| Service Catalog & Requests | Browse catalog items, submit requests, approve/fulfill/reject |
| Knowledge Base | Draft, publish, and browse self-service articles |
| CMDB | Track configuration items (servers, hardware, software, network devices) |

Roles: **Admin** (full access, works tickets, manages users) and **User** (submits and tracks their own incidents/requests, browses catalog and KB).

## Getting started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed        # creates demo users, CIs, incidents, etc.
uvicorn app.main:app --reload --port 8000
```

API docs (Swagger UI): http://localhost:8000/docs

By default the backend uses SQLite (`backend/itsm.db`). Set the `DATABASE_URL` environment variable to point at Postgres instead.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if the backend isn't on `http://localhost:8000`.

### Demo logins

| Role | Email | Password |
|---|---|---|
| Admin | admin@bytebridge.io | Admin123! |
| User | alice@bytebridge.io | Password123! |
| User | bob@bytebridge.io | Password123! |

## Project structure

```
backend/
  app/
    models/      # SQLAlchemy models
    schemas/      # Pydantic request/response schemas
    routers/       # FastAPI route handlers per module
    main.py          # app entrypoint
    seed.py           # demo data seeder
frontend/
  src/
    app/              # Next.js routes (App Router)
    components/        # shared UI + layout components
    lib/                 # API client, auth context, types, utils
```

## Notes

- JWT is stored in `localStorage` for local development simplicity; move to httpOnly cookies before any production deployment.
- Schema is created via `Base.metadata.create_all` — introduce Alembic migrations before making schema changes against a populated database.
