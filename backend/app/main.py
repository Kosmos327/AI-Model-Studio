from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import engine
from app.db.base import Base
from app.models import *  # noqa: F401,F403 - ensure all models are loaded before create_all
from app.api import characters, references, prompts, tasks, media, planner
from app.api.characters import dashboard_router

app = FastAPI(title="AI Model Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    settings.storage_path.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


# Mount storage directory as static files (created eagerly so mount doesn't fail)
_storage = settings.storage_path
_storage.mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory=str(_storage)), name="files")

app.include_router(characters.router, prefix="/api")
app.include_router(references.router, prefix="/api")
app.include_router(prompts.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
