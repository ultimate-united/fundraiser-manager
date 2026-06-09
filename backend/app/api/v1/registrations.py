from fastapi import APIRouter, Depends

from app.core.auth import CurrentUser, get_current_user
from app.db.helpers import execute_rpc, single_row
from app.db.supabase import get_service_client, get_user_client
from app.schemas.registrations import RegisterIn, RegistrationOut

router = APIRouter()


@router.post("/{event_id}", response_model=RegistrationOut, status_code=201)
def register_for_event(
    event_id: str, payload: RegisterIn, user: CurrentUser = Depends(get_current_user)
):
    """Register the current user for an event via the register_for_event RPC
    (atomic capacity check; runs as the user so auth.uid() resolves)."""
    db = get_user_client(user.access_token)
    rpc = execute_rpc(db, "register_for_event", {"p_event_id": event_id, "p_role": payload.role})

    service = get_service_client()
    # Persist the captured sign-up fields (server-controlled column — no user RLS).
    # Best-effort: tolerate the form_data column not existing yet (migration pending).
    if payload.form_data:
        try:
            service.table("event_registrations").update({"form_data": payload.form_data}).eq(
                "id", rpc.data
            ).execute()
        except Exception:
            pass

    res = service.table("event_registrations").select("*").eq("id", rpc.data).limit(1).execute()
    return single_row(res, not_found="Registration created but could not be loaded", status_code=500)


@router.delete("/{event_id}", status_code=204)
def cancel_registration(event_id: str, user: CurrentUser = Depends(get_current_user)):
    """Cancel the current user's registration for an event. Uses the service client
    (scoped explicitly to this user's row) because event_registrations has no
    owner-update RLS policy — status transitions are server-controlled by design."""
    db = get_service_client()
    db.table("event_registrations").update({"status": "cancelled"}).eq("event_id", event_id).eq(
        "user_id", user.id
    ).execute()
    return None
