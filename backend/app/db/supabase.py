from functools import lru_cache

from supabase import create_client, Client

from app.core.config import get_settings


@lru_cache
def get_service_client() -> Client:
    """Service-role client. Bypasses RLS — use for public reads, guest donations,
    Stripe-webhook writes, and admin/service RPCs (e.g. award_points)."""
    settings = get_settings()
    if not settings.supabase_configured:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_user_client(access_token: str) -> Client:
    """A client scoped to the calling user's JWT so RLS policies and auth.uid()
    apply. Used for user-owned mutations and the security-definer RPCs
    (register_for_event, redeem_reward) that read auth.uid()."""
    settings = get_settings()
    key = settings.supabase_anon_key or settings.supabase_service_role_key
    client = create_client(settings.supabase_url, key)
    # Route PostgREST + RPC calls through the user's bearer token.
    client.postgrest.auth(access_token)
    return client
