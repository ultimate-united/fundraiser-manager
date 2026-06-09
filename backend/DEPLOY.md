# Backend deployment (Railway)

Architecture: **Next.js frontend → Netlify**, **FastAPI backend → Railway**, **Postgres/Auth → Supabase**, payments via **Stripe**.

Railway runs *this* `backend/` folder. `railway.json` already sets the build (Nixpacks),
start command (`uvicorn main:app --host 0.0.0.0 --port $PORT`), and a `/health` health check;
`.python-version` pins Python 3.13.

---

## 1. Create the Railway service

1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
2. Open the service → **Settings → Source → Root Directory** = `backend`
   (so Railway builds this folder, not the Next.js root). It will then pick up
   `backend/railway.json` automatically.
3. Build/start are taken from `railway.json` — nothing else to configure there.

## 2. Dev + prod environments

Use Railway **Environments** (top bar) so one service serves both, each pointed at
the matching Supabase project:

- `production` environment → **prod** Supabase + Stripe **live** keys
- a new `dev` (or `staging`) environment → **dev** Supabase + Stripe **test** keys

Set the variables below **per environment**.

## 3. Backend environment variables (set in Railway, per environment)

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | the environment's Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | that project's secret key (`sb_secret_…`) |
| `SUPABASE_ANON_KEY` | that project's publishable key (`sb_publishable_…`) |
| `STRIPE_SECRET_KEY` | dev → `sk_test_…` / `rk_test_…`; prod → restricted `rk_live_…` (preferred over `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | the signing secret from the Stripe **Dashboard** webhook (step 5), per mode |
| `FRONTEND_ORIGINS` | the matching Netlify site URL (e.g. `https://<your-dev-site>.netlify.app`) |

> Railway provides `PORT` automatically — don't set it. Never commit secrets; they live here, not in the repo.

`FRONTEND_ORIGINS` is hygiene only — the browser never calls this API directly
(the FE calls it server-to-server via `apiFetch`, and Stripe hits the webhook
server-to-server), so CORS won't block you.

## 4. Point the frontend at the backend

Railway gives each environment a public URL (Settings → Networking → **Generate Domain**),
e.g. `https://uu-fundraiser-api-dev.up.railway.app`.

In **Netlify** (the matching FE site) → Environment variables:
- `NEXT_PUBLIC_API_URL` = that Railway URL (no trailing slash)

Then redeploy the Netlify site (NEXT_PUBLIC_* is inlined at build time).

## 5. Stripe webhook (per mode)

In the Stripe **Dashboard** (toggle Test/Live to match the environment):
1. Developers → **Webhooks → Add endpoint** →
   `https://<railway-url>/api/v1/webhooks/stripe`
2. Select events: `payment_intent.succeeded`, `checkout.session.completed`,
   `invoice.payment_succeeded`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
3. Copy the endpoint's **Signing secret** (`whsec_…`) → set it as `STRIPE_WEBHOOK_SECRET`
   on the matching Railway environment.

(The local `stripe listen` secret is only for local dev.)

Also activate the **Customer Portal** once per mode: Settings → Billing → Customer portal → Save.

## 6. Verify

- `https://<railway-url>/health` → `{"status":"ok","supabase_configured":true}`
- `https://<railway-url>/api/v1/events/` → seeded events JSON
- `https://<railway-url>/docs` → FastAPI Swagger UI

## Notes

- Migrations are still applied with the Supabase CLI (`supabase db push`), not by Railway.
- Auto-deploys on push to the branch each Railway environment tracks (mirrors your Netlify flow).
- If the build picks the wrong Python (the code is fine on 3.11+, but to force 3.13),
  set a Railway variable `NIXPACKS_PYTHON_VERSION=3.13` in addition to `.python-version`.
