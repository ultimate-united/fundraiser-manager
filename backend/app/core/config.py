import os
from functools import lru_cache


class Settings:
    """Runtime configuration sourced from environment variables.

    Kept dependency-free (plain os.getenv) since the repo does not pull in
    pydantic-settings. Load a local .env via python-dotenv in main.py.
    """

    def __init__(self) -> None:
        self.supabase_url: str = os.getenv("SUPABASE_URL", "")
        self.supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        # Anon key is used to build user-scoped clients so RLS + auth.uid() apply.
        self.supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
        # CORS origins for the Next.js frontend.
        self.frontend_origins: list[str] = [
            o.strip()
            for o in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
            if o.strip()
        ]
        # Stripe is stubbed until keys/account are ready (Phase 2 follow-up).
        self.stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
