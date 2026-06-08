"""Dev-only seed: a demo member + activity so the member dashboard renders real data.

Reproduces the frontend mock (app/dashboard/page.tsx + dashboard components) as real rows in
the **dev** Supabase project, so we can wire the dashboard to live data and see it populated.

Idempotent: deletes the demo user's donations (ON DELETE SET NULL, so they must go explicitly)
then deletes & recreates the demo auth user — which cascades profile, registrations, points,
badges, recurring donations. The 5 extra past events are upserted by slug.

SAFETY: refuses to run unless the configured Supabase URL is the dev project — never prod.

Run:  cd backend && .venv/bin/python scripts/seed_dev.py
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env.local")  # dev credentials

DEV_REF = "uiabdcilzbnqpaarigqe"
URL = os.getenv("SUPABASE_URL", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

EXPECTED_HOST = f"https://{DEV_REF}.supabase.co"
if not URL.startswith(EXPECTED_HOST):
    sys.exit(f"ABORT: SUPABASE_URL ({URL!r}) is not the dev project {EXPECTED_HOST}. Dev only.")
if not SERVICE_KEY:
    sys.exit("ABORT: SUPABASE_SERVICE_ROLE_KEY missing in backend/.env.local")

sb = create_client(URL, SERVICE_KEY)

DEMO_EMAIL = "dev@placeholder.com"
DEMO_PASSWORD = "DevPassword123!"

# 5 genuinely-past events (status 'completed') the demo member ATTENDED.
# (slug, title, subtitle, points_reward, date, hours_logged) — hours sum to 24.
PAST_EVENTS = [
    ("beach-cleanup-drive-2026", "Beach Cleanup Drive", "Caring for our coastlines", 25, "2026-05-15", 4),
    ("youth-mentorship-program-2026", "Youth Mentorship Program", "Guiding the next generation", 50, "2026-05-28", 6),
    ("food-bank-volunteer-day-2026", "Food Bank Volunteer Day", "Nourishing our neighbours", 30, "2026-04-20", 6),
    ("winter-warmth-drive-2025", "Winter Warmth Drive", "Comfort for the cold months", 20, "2025-12-10", 4),
    ("community-tree-planting-2025", "Community Tree Planting", "Growing a greener city", 25, "2025-11-05", 4),
]
# The 3 real fundraising events are FUTURE-dated, so the demo member is only REGISTERED for them
# (Upcoming tab). You can't have "attended" an event that hasn't happened yet.
REAL_SLUGS = ["run-for-hope-2026", "mothers-day-celebration-2026", "summer-learning-camp-2026"]

# Donation history from components/dashboard/donations-content.tsx — amounts in MINOR units (cents).
DONATIONS = [
    ("2026-05-01", 10000),
    ("2026-04-18", 25000),
    ("2026-04-01", 10000),
    ("2026-03-10", 30000),
    ("2026-03-01", 10000),
]
# Points ledger (sums to 285 -> silver tier). Source of truth for total_points.
POINTS = [
    (160, "Event participation", "event"),
    (85, "Donation rewards", "donation"),
    (40, "Welcome & engagement bonus", "adjustment"),
]
# Earned badges (rewards-content.tsx: earned == true).
EARNED_BADGE_CODES = ["first-event", "five-events", "first-donation"]

# Codify the mock contract so it fails loudly if someone edits the data above.
assert sum(delta for delta, _, _ in POINTS) == 285, "POINTS must sum to 285 (silver tier minimum)"
assert sum(e[5] for e in PAST_EVENTS) == 24, "attended-event hours must sum to 24 (hoursVolunteered)"


def find_user_id(email: str):
    page = 1
    while True:
        users = sb.auth.admin.list_users(page=page, per_page=200)
        if not users:
            return None
        for u in users:
            if (u.email or "").lower() == email.lower():
                return u.id
        if len(users) < 200:
            return None
        page += 1


def main():
    # --- Idempotency: wipe prior demo data ---
    existing = find_user_id(DEMO_EMAIL)
    if existing:
        sb.table("donations").delete().eq("user_id", existing).execute()  # SET NULL, delete first
        sb.auth.admin.delete_user(existing)  # cascades profile + registrations + points + badges
        print(f"• removed existing demo user {existing}")

    # --- 1. Create demo auth user -> trigger creates profile + notification_preferences ---
    uid = sb.auth.admin.create_user({
        "email": DEMO_EMAIL,
        "password": DEMO_PASSWORD,
        "email_confirm": True,
        "user_metadata": {"first_name": "Member", "last_name": ""},
    }).user.id
    print(f"• created demo user {uid}  ({DEMO_EMAIL} / {DEMO_PASSWORD})")
    # NB: first_name/last_name are set by the on_auth_user_created trigger from user_metadata.

    org_id = sb.table("organizers").select("id").eq("slug", "ultimate-united").single().execute().data["id"]

    # --- 2. Upsert 5 past 'completed' events (one batched call) ---
    sb.table("events").upsert([{
        "organizer_id": org_id, "slug": slug, "title": title, "subtitle": subtitle,
        "starts_at": f"{date}T09:00:00+08:00", "ends_at": f"{date}T17:00:00+08:00",
        "location": "Hong Kong", "points_reward": pts, "status": "completed", "featured": False,
    } for slug, title, subtitle, pts, date, _hours in PAST_EVENTS], on_conflict="slug").execute()

    # --- 3. Registrations: 3 future real events are UPCOMING (registered, 0h); 5 genuinely-past
    #        events are ATTENDED with their logged hours (sum = 24). ---
    all_slugs = REAL_SLUGS + [e[0] for e in PAST_EVENTS]
    events = {r["slug"]: r for r in
              sb.table("events").select("id,slug,points_reward").in_("slug", all_slugs).execute().data}
    past_hours = {e[0]: e[5] for e in PAST_EVENTS}
    regs = [{
        "user_id": uid, "event_id": events[slug]["id"], "role": "attendee", "status": "registered",
        "hours_logged": 0, "points_earned": events[slug]["points_reward"],
    } for slug in REAL_SLUGS] + [{
        "user_id": uid, "event_id": events[slug]["id"], "role": "attendee", "status": "attended",
        "hours_logged": past_hours[slug], "points_earned": events[slug]["points_reward"],
    } for slug in past_hours]
    sb.table("event_registrations").upsert(regs, on_conflict="user_id,event_id").execute()

    # --- 4. Donations (completed) + recurring ---
    sb.table("donations").insert([{
        "user_id": uid, "amount": cents, "currency": "HKD", "status": "completed",
        "kind": "one_time", "donor_name": "Member", "donor_email": DEMO_EMAIL,
        "created_at": f"{date}T12:00:00+08:00",
    } for date, cents in DONATIONS]).execute()
    sb.table("recurring_donations").insert({
        "user_id": uid, "amount": 10000, "currency": "HKD", "frequency": "monthly",
        "status": "active", "next_charge_at": "2026-07-01T00:00:00+08:00",
    }).execute()

    # --- 5. Points ledger (one batched call) ---
    sb.table("point_transactions").insert(
        [{"user_id": uid, "delta": delta, "reason": reason, "source_type": src}
         for delta, reason, src in POINTS]).execute()

    # --- 6. Earned badges (one batched upsert) ---
    badge_ids = sb.table("badges").select("id,code").in_("code", EARNED_BADGE_CODES).execute().data
    sb.table("user_badges").upsert([{"user_id": uid, "badge_id": b["id"]} for b in badge_ids],
                                   on_conflict="user_id,badge_id").execute()

    # --- 7. Verify from base tables (v_member_dashboard can't be read by service_role:
    #        it is security_invoker and joins auth.users, which service_role lacks SELECT on) ---
    total_points = sum(p["delta"] for p in
                       sb.table("point_transactions").select("delta").eq("user_id", uid).execute().data)
    total_donated = sum(d["amount"] for d in sb.table("donations").select("amount")
                        .eq("user_id", uid).eq("status", "completed").execute().data)
    regs = sb.table("event_registrations").select("status,hours_logged").eq("user_id", uid).execute().data
    tiers = sorted(sb.table("tiers").select("code,min_points").execute().data,
                   key=lambda t: t["min_points"], reverse=True)
    tier = next((t["code"] for t in tiers if t["min_points"] <= total_points), "bronze")
    print("• verify:", {
        "tier": tier, "total_points": total_points, "total_donated_cents": total_donated,
        "events_attended": sum(1 for r in regs if r["status"] == "attended"),
        "hours_volunteered": sum(float(r["hours_logged"]) for r in regs),
        "badges": len(sb.table("user_badges").select("id").eq("user_id", uid).execute().data),
    })
    print("DONE.")


if __name__ == "__main__":
    main()
