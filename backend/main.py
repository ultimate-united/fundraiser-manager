from dotenv import load_dotenv

# Load env before anything reads settings. .env.local (gitignored) wins over .env.
load_dotenv(".env")
load_dotenv(".env.local", override=True)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from app.api.v1 import router as api_router  # noqa: E402
from app.core.config import get_settings  # noqa: E402

settings = get_settings()

app = FastAPI(
    title="Fundraiser Manager API",
    version="0.2.0",
    description="Events Manager Platform — Phase 1 + 2 backend (events, accounts, donations, rewards).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "supabase_configured": settings.supabase_configured}
