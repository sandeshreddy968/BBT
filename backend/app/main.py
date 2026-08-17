from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 - ensures all models are registered on Base
from app.config import settings
from app.database import Base, engine
from app.routers import auth, catalog, changes, cis, dashboard, incidents, knowledge, problems, requests, users

app = FastAPI(title="ByteBridge ITSM")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cis.router)
app.include_router(incidents.router)
app.include_router(problems.router)
app.include_router(changes.router)
app.include_router(catalog.router)
app.include_router(requests.router)
app.include_router(knowledge.router)
app.include_router(dashboard.router)
