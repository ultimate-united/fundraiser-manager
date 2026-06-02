-- =====================================================================
-- Phase 1 — Read-only events (organizers, events, dynamic sections)
-- Events Manager Platform · Supabase (Postgres)
-- Apply in the Supabase SQL editor or via `supabase db push`.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Shared: updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.event_status as enum ('draft','upcoming','ongoing','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.section_kind as enum ('rich_text','schedule','sponsors','contribution','faq','organizer','custom');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- organizers (multi-tenant; UU is the first row)
-- ---------------------------------------------------------------------
create table if not exists public.organizers (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  mission      text,
  logo_url     text,
  website_url  text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_organizers_updated_at on public.organizers;
create trigger trg_organizers_updated_at before update on public.organizers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- events (core structured columns; free-form content in event_sections)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  organizer_id      uuid not null references public.organizers(id) on delete restrict,
  parent_event_id   uuid references public.events(id) on delete set null,
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  mission           text,
  summary           text,
  banner_image      text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  location          text,
  fundraising_goal  integer,         -- minor units (cents); null = non-fundraising
  participant_goal  integer,
  volunteer_spots   integer,
  points_reward     integer not null default 0,
  status            public.event_status not null default 'draft',
  featured          boolean not null default false,
  seo_title         text,
  seo_description   text,
  og_image          text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index if not exists idx_events_organizer  on public.events(organizer_id);
create index if not exists idx_events_status      on public.events(status) where deleted_at is null;
create index if not exists idx_events_featured     on public.events(featured) where deleted_at is null;
create index if not exists idx_events_starts_at    on public.events(starts_at);
create index if not exists idx_events_parent       on public.events(parent_event_id);

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- event_sections (dynamic tabs / WYSIWYG content)
-- ---------------------------------------------------------------------
create table if not exists public.event_sections (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  kind       public.section_kind not null,
  title      text not null,
  position   integer not null default 0,
  content    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_sections_event on public.event_sections(event_id, position);

drop trigger if exists trg_event_sections_updated_at on public.event_sections;
create trigger trg_event_sections_updated_at before update on public.event_sections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- View: v_event_public — exposes events + placeholder aggregate columns.
-- Self-contained so Phase 1 applies standalone. Phase 2 (0002) redefines this
-- view (CREATE OR REPLACE, same columns/types) to compute real amount_raised /
-- participant_count from donations & event_registrations.
-- ---------------------------------------------------------------------
create or replace view public.v_event_public as
select
  e.*,
  0::bigint          as amount_raised,
  0::int             as participant_count,
  e.volunteer_spots  as spots_left
from public.events e
where e.deleted_at is null;

-- ---------------------------------------------------------------------
-- RLS — public read for published content; writes via service-role/admin only
-- ---------------------------------------------------------------------
alter table public.organizers     enable row level security;
alter table public.events         enable row level security;
alter table public.event_sections enable row level security;

drop policy if exists "organizers public read" on public.organizers;
create policy "organizers public read" on public.organizers
  for select using (is_verified = true);

drop policy if exists "events public read" on public.events;
create policy "events public read" on public.events
  for select using (status <> 'draft' and deleted_at is null);

drop policy if exists "event_sections public read" on public.event_sections;
create policy "event_sections public read" on public.event_sections
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_sections.event_id
        and e.status <> 'draft' and e.deleted_at is null
    )
  );

-- ---------------------------------------------------------------------
-- Seed — Ultimate United + 3 events (from frontend lib/mock-data.ts)
-- amount_raised/participant_count stay 0 until real donations/registrations
-- accrue (ledger-first). Seed donations later if you want demo numbers.
-- ---------------------------------------------------------------------
insert into public.organizers (slug, name, mission, website_url, is_verified)
values (
  'ultimate-united',
  'Ultimate United',
  'A nonprofit dedicated to promoting education and providing resources to underprivileged communities in Hong Kong.',
  'https://ultimateunited.org',
  true
)
on conflict (slug) do nothing;

-- Event 1: Run for Hope 2026
insert into public.events (organizer_id, slug, title, subtitle, mission, summary, banner_image,
  starts_at, ends_at, location, fundraising_goal, participant_goal, points_reward, status, featured)
select o.id, 'run-for-hope-2026', 'Run for Hope 2026', 'Every Step Counts',
  'To provide educational opportunities and emotional support for underprivileged children, empowering them to break the cycle of poverty through knowledge and community.',
  'Join us for our annual charity run supporting underprivileged children in Hong Kong. This year, we are running to raise funds for education resources, after-school programs, and mental health support for over 390 children across the city.',
  '/images/run-for-hope-banner.jpg',
  '2026-07-15T08:00:00+08:00', '2026-07-15T18:00:00+08:00', 'Victoria Park, Hong Kong',
  50000000, 500, 50, 'upcoming', true
from public.organizers o where o.slug = 'ultimate-united'
on conflict (slug) do nothing;

-- Event 2: Mother's Day Celebration 2026
insert into public.events (organizer_id, slug, title, subtitle, mission, summary, banner_image,
  starts_at, ends_at, location, fundraising_goal, participant_goal, points_reward, status, featured)
select o.id, 'mothers-day-celebration-2026', 'Mother''s Day Celebration 2026', 'Honoring Single Mothers',
  'To recognize and support single mothers who work tirelessly to provide for their families, offering them a day of rest and appreciation.',
  'A special celebration honoring the incredible single mothers in our community. Join us for a day of pampering, workshops, and community building.',
  '/images/mothers-day-banner.jpg',
  '2026-05-10T10:00:00+08:00', '2026-05-10T16:00:00+08:00', 'Tsim Sha Tsui Community Center',
  15000000, 120, 40, 'upcoming', false
from public.organizers o where o.slug = 'ultimate-united'
on conflict (slug) do nothing;

-- Event 3: Summer Learning Camp 2026
insert into public.events (organizer_id, slug, title, subtitle, mission, summary, banner_image,
  starts_at, ends_at, location, fundraising_goal, participant_goal, points_reward, status, featured)
select o.id, 'summer-learning-camp-2026', 'Summer Learning Camp 2026', 'Igniting Young Minds',
  'To bridge the educational gap during summer holidays, ensuring that children from low-income families continue to learn and grow.',
  'A two-week intensive summer camp providing educational enrichment, creative arts, and life skills training for underprivileged children aged 6-14.',
  '/images/summer-camp-banner.jpg',
  '2026-08-01T09:00:00+08:00', '2026-08-14T17:00:00+08:00', 'Multiple Locations Across Hong Kong',
  30000000, 200, 60, 'upcoming', false
from public.organizers o where o.slug = 'ultimate-united'
on conflict (slug) do nothing;

-- Sections for Run for Hope 2026
insert into public.event_sections (event_id, kind, title, position, content)
select e.id, 'sponsors'::public.section_kind, 'Sponsors', 1, '[
  {"name":"Hong Kong Community Foundation","tier":"platinum"},
  {"name":"Pacific Century Group","tier":"gold"},
  {"name":"HSBC","tier":"gold"},
  {"name":"Swire Properties","tier":"silver"}
]'::jsonb
from public.events e where e.slug = 'run-for-hope-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'schedule', 'Schedule', 2, '[
  {"time":"08:00","title":"Registration & Check-in","description":"Collect your race kit and warm up","location":"Main Entrance"},
  {"time":"09:00","title":"Opening Ceremony","description":"Welcome address and mission sharing","location":"Main Stage"},
  {"time":"09:30","title":"10km Run Starts","description":"Competitive and fun run categories","location":"Start Line"},
  {"time":"10:00","title":"5km Family Run Starts","description":"Perfect for families with children","location":"Start Line"},
  {"time":"12:00","title":"Community Lunch","description":"Enjoy local food stalls and connect with fellow runners","location":"Food Village"},
  {"time":"14:00","title":"Awards Ceremony","description":"Celebrating our top fundraisers and runners","location":"Main Stage"},
  {"time":"15:00","title":"Charity Auction","description":"Bid on exclusive items to support our cause","location":"Auction Tent"},
  {"time":"17:00","title":"Closing & Thank You","description":"Gratitude ceremony and group photo","location":"Main Stage"}
]'::jsonb
from public.events e where e.slug = 'run-for-hope-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'contribution', 'How to Contribute', 3, '[
  {"type":"donation","title":"Financial Support","description":"Every dollar directly supports educational materials, tutoring, and after-school programs for children in need."},
  {"type":"time","title":"Volunteer Your Time","description":"Help us on event day with registration, water stations, or cheering stations. No experience needed!"},
  {"type":"skills","title":"Share Your Skills","description":"Are you a photographer, first-aider, or event coordinator? We need your expertise!"}
]'::jsonb
from public.events e where e.slug = 'run-for-hope-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id);

-- Sections for Mother's Day Celebration 2026
insert into public.event_sections (event_id, kind, title, position, content)
select e.id, 'sponsors'::public.section_kind, 'Sponsors', 1, '[
  {"name":"Women for Women HK","tier":"platinum"},
  {"name":"Family First Foundation","tier":"gold"}
]'::jsonb
from public.events e where e.slug = 'mothers-day-celebration-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'schedule', 'Schedule', 2, '[
  {"time":"10:00","title":"Welcome & Registration","description":"Light refreshments provided","location":"Main Hall"},
  {"time":"10:30","title":"Wellness Workshop","description":"Self-care and stress management techniques","location":"Workshop Room A"},
  {"time":"12:00","title":"Lunch & Networking","description":"Connect with other mothers and share stories","location":"Dining Hall"},
  {"time":"14:00","title":"Pampering Sessions","description":"Complimentary haircuts, manicures, and massages","location":"Wellness Zone"},
  {"time":"15:30","title":"Closing Ceremony","description":"Gift distribution and group celebration","location":"Main Hall"}
]'::jsonb
from public.events e where e.slug = 'mothers-day-celebration-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'contribution', 'How to Contribute', 3, '[
  {"type":"donation","title":"Sponsor a Mother","description":"Your donation provides gift packages, meals, and wellness treatments for mothers in need."},
  {"type":"time","title":"Event Support","description":"Help with setup, serving meals, or childcare during the event."},
  {"type":"skills","title":"Professional Services","description":"Hairstylists, nail technicians, and massage therapists needed for pampering sessions."}
]'::jsonb
from public.events e where e.slug = 'mothers-day-celebration-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id);

-- Sections for Summer Learning Camp 2026
insert into public.event_sections (event_id, kind, title, position, content)
select e.id, 'sponsors'::public.section_kind, 'Sponsors', 1, '[
  {"name":"Education First HK","tier":"platinum"},
  {"name":"Youth Development Fund","tier":"silver"}
]'::jsonb
from public.events e where e.slug = 'summer-learning-camp-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'schedule', 'Daily Schedule', 2, '[
  {"time":"09:00","title":"Morning Assembly","description":"Daily briefing and energizer activities"},
  {"time":"09:30","title":"Academic Sessions","description":"English, Math, and Science workshops"},
  {"time":"12:00","title":"Lunch Break","description":"Nutritious meals provided"},
  {"time":"13:00","title":"Creative Arts","description":"Music, art, and drama classes"},
  {"time":"15:00","title":"Sports & Recreation","description":"Team building and physical activities"},
  {"time":"16:30","title":"Reflection & Closing","description":"Daily journal writing and sharing"}
]'::jsonb
from public.events e where e.slug = 'summer-learning-camp-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id)
union all
select e.id, 'contribution', 'How to Contribute', 3, '[
  {"type":"donation","title":"Sponsor a Child","description":"HK$1,500 sponsors one child for the entire two-week camp including meals, materials, and activities."},
  {"type":"time","title":"Teaching Assistant","description":"Help our teachers in classrooms, supervise activities, or mentor students."},
  {"type":"skills","title":"Guest Instructor","description":"Share your expertise in arts, sports, coding, or any special skill with our campers."}
]'::jsonb
from public.events e where e.slug = 'summer-learning-camp-2026' and not exists (select 1 from public.event_sections s where s.event_id = e.id);
