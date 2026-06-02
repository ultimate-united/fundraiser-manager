# Fundraiser Manager — Backend (Phase 1 + 2)

FastAPI + supabase-py backend for the Events Manager Platform. Implements the public
events API (Phase 1) and accounts / donations / rewards / dashboard (Phase 2).

> Schema design: see `MEMORY/WORK/20260601-182935_supabase-schema-design-plan/` and the
> Notion page "Database Schema & Data Models".

## Layout
```
fundraiser-manager/
  supabase/
    config.toml                # Supabase CLI config
    migrations/                # SINGLE SOURCE OF TRUTH for the DB schema
      20260602000001_phase1_events.sql       # organizers, events, event_sections, v_event_public, seed
      20260602000002_phase2_accounts_rewards.sql  # profiles, registrations, donations, rewards, RLS, RPCs, seed
  backend/
    main.py                    # FastAPI app + CORS + dotenv loading
    app/
      core/      config.py, auth.py        # settings + Supabase JWT auth dependency
      db/        supabase.py, helpers.py   # service + user-scoped clients + shared helpers
      services/  payments.py               # Stripe seam (stubbed)
      schemas/   *.py                       # Pydantic request/response models
      api/v1/    events, organizers, registrations, donations, rewards, users
```

## 1. Set up Supabase (dev + prod via the CLI)
Migrations live in `supabase/migrations/` and are pushed to each project. Both are
idempotent — safe to re-run.

```bash
brew install supabase/tap/supabase          # install CLI
supabase login                               # one-time
# DEV
supabase link --project-ref <DEV_PROJECT_REF>
supabase db push
# PROD
supabase link --project-ref <PROD_PROJECT_REF>
supabase db push
```
Create the two projects at https://database.new (`...-dev` and `...-prod`). For purely
local development, `supabase start` runs the full stack in Docker and auto-applies these
migrations. Grab each project's keys from Project Settings → API.

> Manual alternative (no CLI): paste each file from `supabase/migrations/` into the
> dashboard SQL editor **in timestamp order**.

## 2. Environment (one file per environment)
Each Supabase project has its own URL + keys (Settings → API), so keep them separate:
- `backend/.env.local` → **dev** project keys (used in local development)
- `backend/.env.production` → **prod** project keys (loaded by the prod deploy)

Copy `.env.example` → the relevant file and fill in:
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role key>   # server-side only, never expose to FE
SUPABASE_ANON_KEY=<anon key>                    # used for user-scoped (RLS) calls
FRONTEND_ORIGINS=http://localhost:3000          # comma-separated for CORS
STRIPE_SECRET_KEY=                              # leave blank until payments are wired
```
> `SUPABASE_ANON_KEY` is **new** — required for the user-scoped client used by
> register/redeem RPCs and recurring-donation writes (so RLS + `auth.uid()` apply).
> Never commit `.env.local` / `.env.production` (the service-role key is a full-access secret).

## 3. Run
```bash
cd backend
.venv/bin/pip install -r requirements.txt   # or: pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000
```
Open http://localhost:8000/docs for the interactive OpenAPI UI. `GET /health` reports
whether Supabase is configured.

## Auth
Endpoints under `/users`, plus register/redeem/recurring, expect
`Authorization: Bearer <supabase access_token>` (the JWT from supabase-js on the FE).
Public reads (`/events`, `/organizers`, `/rewards/*` catalogs) need no auth.

## Endpoints (all under `/api/v1`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/events` | – | events feed (filters: status, featured, organizer_id, limit, offset) |
| GET | `/events/{slug}` | – | event detail + dynamic sections |
| GET | `/organizers` · `/organizers/{slug}` | – | organizer list / detail |
| GET | `/rewards/badges` · `/rewards/rewards` · `/rewards/tiers` | – | reward catalogs |
| POST | `/rewards/redeem/{reward_id}` | ✔ | redeem a reward (atomic points check) |
| POST | `/registrations/{event_id}` | ✔ | register for an event |
| DELETE | `/registrations/{event_id}` | ✔ | cancel registration |
| POST | `/donations` | optional | record a donation (member or guest) |
| GET | `/donations` | ✔ | my donations |
| POST/GET | `/donations/recurring` | ✔ | create / list recurring subscriptions |
| PATCH | `/donations/recurring/{id}` | ✔ | pause / change a subscription |
| GET/PATCH | `/users/me` | ✔ | profile |
| GET | `/users/me/dashboard` | ✔ | aggregated dashboard (points, donated, attended, hours, tier) |
| GET/PATCH | `/users/me/notifications` | ✔ | notification preferences |
| GET | `/users/me/registrations` · `/donations` · `/badges` · `/redemptions` | ✔ | my data |

## Notes & follow-ups
- **Money is stored in minor units (cents).** `amount: 10000` = HK$100.
- **Stripe is stubbed.** `POST /donations` records a `pending` donation and returns a stub
  payment intent. To finish: `pip install stripe`, set `STRIPE_SECRET_KEY`, implement
  `app/services/payments.create_payment_intent`, and add a webhook route that flips the
  donation to `completed` and calls the `award_points` RPC.
- **Computed numbers are views**, not stored counters: `v_event_public` (amount_raised,
  participant_count, spots_left) and `v_member_dashboard` (points, donated, attended,
  hours, tier). Seeded events therefore show 0 raised until real donations land — seed a
  few `donations` rows if you want demo figures.
- Migrations were validated by applying both (twice) to a throwaway Postgres 16; RPCs and
  the auth-user → profile trigger were exercised. They have **not** been run against your
  live Supabase — that's your next step.
