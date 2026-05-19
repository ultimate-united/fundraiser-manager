# Fundraiser Manager

A web application for managing fundraising events, donations, and volunteer rewards. Built with Next.js 16, Supabase, and shadcn/ui.

## Tech Stack

**Frontend**
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth & Database:** Supabase
- **UI:** shadcn/ui + Radix UI + Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **Package Manager:** pnpm

**Backend**
- **Framework:** Python FastAPI
- **Database:** Supabase PostgreSQL
- **Package Manager:** pip + venv

## Getting Started

### Frontend

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Configure environment

`.env.local` is already present with placeholder values. Replace with your real Supabase credentials when ready:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project → **Settings → API**.

#### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Backend

#### 1. Create virtual environment and install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Fill in your Supabase service role key in `backend/.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3. Run the API server

```bash
cd backend
.venv/bin/uvicorn main:app --reload
```

API runs at [http://localhost:8000](http://localhost:8000). Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Project Structure

```
app/
├── auth/                  # Login, sign-up, callback routes
├── login/                 # Redirects → /auth/login
├── dashboard/
│   ├── page.tsx           # Overview
│   ├── events/            # My Events (placeholder)
│   ├── donations/         # Donations (placeholder)
│   ├── rewards/           # Rewards
│   └── settings/          # Settings (placeholder)
├── donate/                # Donation flow
└── events/                # Event listings and detail pages
components/
├── dashboard/             # Dashboard-specific components
├── donate/                # Donation form and impact display
├── events/                # Event cards, hero, tabs
├── home/                  # Landing page sections
├── layout/                # Header and footer
└── ui/                    # shadcn/ui base components
lib/
└── supabase/              # Supabase client (browser, server, proxy)
backend/
├── main.py                # FastAPI app entry point
├── requirements.txt
├── .env.example
└── app/
    ├── api/v1/            # REST endpoints: events, donations, users
    └── db/
        └── supabase.py    # Supabase client factory
```

## Auth Notes

Dashboard auth is currently bypassed for local development (Supabase not yet configured). Search for `TODO: Remove bypass` to find the lines to restore when Supabase is set up. Affected pages: `dashboard`, `dashboard/events`, `dashboard/donations`, `dashboard/rewards`, `dashboard/settings`.

## Frontend Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server (requires build) |
| `pnpm lint` | Run ESLint |
