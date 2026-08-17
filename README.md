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

## Deployment

Recommended setup for a small team: **Vercel** for the frontend + **Render** for the backend with a managed Postgres database. Both platforms deploy straight from this GitHub repo.

### 1. Backend (Render)

The repo includes a `render.yaml` Blueprint that defines the backend service and a free Postgres database together:

1. In the Render dashboard: **New → Blueprint**, pick this GitHub repo. Render reads `render.yaml` automatically and shows a plan for `bytebridge-itsm-backend` (web service, rooted at `backend/`) + `bytebridge-itsm-db` (Postgres).
2. It'll prompt you for the one variable marked `sync: false` — **`ALLOWED_ORIGINS`**. You can put a placeholder like `http://localhost:3000` for now and update it once you have the Vercel URL (step 3 below).
3. Click **Apply**. Render provisions the database, wires `DATABASE_URL` to it automatically, and generates a random `SECRET_KEY` for you — nothing to copy/paste for either.
4. Once deployed, test it: `https://<your-service>.onrender.com/health` should return `{"status":"ok"}`.
5. **Optional demo data**: open a shell for the service (Render dashboard → service → **Shell**) and run `python -m app.seed` to get sample tickets and an admin login. This creates the same published demo credentials as local dev (`admin@bytebridge.io` / `Admin123!`) — **change or remove that account immediately if you seed a real deployment**, since there's currently no in-app "change password" flow (see Notes).

Don't have Blueprints enabled, or prefer manual setup? Create a **Web Service** from the repo with root directory `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, add a Postgres instance from **New → PostgreSQL**, and set the env vars from `backend/.env.example` by hand (`DATABASE_URL` from the Postgres instance's connection string, a generated `SECRET_KEY`, etc).

### 2. Frontend (Vercel)

1. Import this repo into Vercel, with **root directory set to `frontend`**.
2. Set the environment variable `NEXT_PUBLIC_API_URL` to your deployed backend's URL (from step 1).
3. Deploy. Vercel auto-detects the Next.js build.
4. Go back to the Render service → **Environment**, update `ALLOWED_ORIGINS` to this Vercel URL, and save — Render redeploys automatically on env var changes.

### Inviting your team

Once both are deployed, anyone can go to the frontend URL and either register (`/register`, creates a `user`-role account) or be given the admin credentials directly. To promote someone to admin, an existing admin can do it from **Admin → Users** in the app.

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
- CORS origins are configurable via the `ALLOWED_ORIGINS` env var (comma-separated), defaulting to `http://localhost:3000`.
- There's no in-app "change password" flow yet — if you seed demo credentials into a real deployment, get an admin to update that user's record directly (e.g. via a one-off script calling `security.hash_password`) rather than leaving the published demo password active.
