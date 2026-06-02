-- =====================================================================
-- Phase 2 — Accounts, payments, rewards, dashboard
-- Depends on 0001_phase1_events.sql. Apply AFTER it.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin create type public.profile_type as enum ('individual','family','corporate','in_need'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_role as enum ('member','organizer','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.member_tier as enum ('bronze','silver','gold','platinum'); exception when duplicate_object then null; end $$;
do $$ begin create type public.registration_role as enum ('attendee','volunteer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.registration_status as enum ('registered','attended','cancelled','no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type public.donation_status as enum ('pending','completed','failed','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.donation_kind as enum ('one_time','recurring'); exception when duplicate_object then null; end $$;
do $$ begin create type public.recurring_frequency as enum ('weekly','monthly','quarterly','yearly'); exception when duplicate_object then null; end $$;
do $$ begin create type public.recurring_status as enum ('active','paused','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.point_source as enum ('donation','event','redemption','adjustment'); exception when duplicate_object then null; end $$;
do $$ begin create type public.badge_criteria as enum ('events_attended','donations_made','consecutive_months','hours_volunteered'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reward_category as enum ('discount','experience','recognition','merch'); exception when duplicate_object then null; end $$;
do $$ begin create type public.redemption_status as enum ('pending','fulfilled','cancelled'); exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null default '',
  last_name     text not null default '',
  avatar_url    text,
  profile_type  public.profile_type not null default 'individual',
  role          public.user_role not null default 'member',
  tier_override public.member_tier,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Guard: only the service role may change role / tier_override (no self-escalation)
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.role := old.role;
    new.tier_override := old.tier_override;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------
-- notification_preferences (1:1)
-- ---------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  event_reminders     boolean not null default true,
  donation_receipts   boolean not null default true,
  newsletter          boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_notif_prefs_updated_at on public.notification_preferences;
create trigger trg_notif_prefs_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- New auth user -> create profile + default notification preferences
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- event_registrations
-- ---------------------------------------------------------------------
create table if not exists public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  event_id      uuid not null references public.events(id) on delete cascade,
  role          public.registration_role not null default 'attendee',
  status        public.registration_status not null default 'registered',
  hours_logged  numeric(5,2) not null default 0,
  points_earned integer not null default 0,
  registered_at timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, event_id)
);
create index if not exists idx_registrations_user  on public.event_registrations(user_id);
create index if not exists idx_registrations_event on public.event_registrations(event_id);

drop trigger if exists trg_registrations_updated_at on public.event_registrations;
create trigger trg_registrations_updated_at before update on public.event_registrations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- event_donation_tiers (per-profile-type pricing; in_need = free)
-- ---------------------------------------------------------------------
create table if not exists public.event_donation_tiers (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete cascade,
  profile_type      public.profile_type not null,
  suggested_amounts integer[] not null default '{}',   -- minor units (cents)
  min_amount        integer not null default 0,
  is_free           boolean not null default false,
  created_at        timestamptz not null default now(),
  unique (event_id, profile_type)
);
create index if not exists idx_donation_tiers_event on public.event_donation_tiers(event_id);

-- ---------------------------------------------------------------------
-- recurring_donations (subscription)
-- ---------------------------------------------------------------------
create table if not exists public.recurring_donations (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  event_id               uuid references public.events(id) on delete set null,  -- null = general fund
  amount                 integer not null,            -- minor units
  currency               char(3) not null default 'HKD',
  frequency              public.recurring_frequency not null default 'monthly',
  status                 public.recurring_status not null default 'active',
  next_charge_at         timestamptz,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists idx_recurring_user on public.recurring_donations(user_id);

drop trigger if exists trg_recurring_updated_at on public.recurring_donations;
create trigger trg_recurring_updated_at before update on public.recurring_donations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- donations (each charge; nullable user_id=guest, event_id=general fund)
-- ---------------------------------------------------------------------
create table if not exists public.donations (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references public.profiles(id) on delete set null,
  event_id                 uuid references public.events(id) on delete set null,
  recurring_donation_id    uuid references public.recurring_donations(id) on delete set null,
  amount                   integer not null,          -- minor units
  currency                 char(3) not null default 'HKD',
  status                   public.donation_status not null default 'pending',
  kind                     public.donation_kind not null default 'one_time',
  donor_name               text,
  donor_email              text,
  message                  text,
  is_anonymous             boolean not null default false,
  dedicated_to             text,
  points_awarded           integer not null default 0,
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now(),
  deleted_at               timestamptz,
  constraint donations_amount_positive check (amount > 0)
);
create index if not exists idx_donations_user  on public.donations(user_id);
create index if not exists idx_donations_event on public.donations(event_id);
create index if not exists idx_donations_status on public.donations(status);

-- ---------------------------------------------------------------------
-- point_transactions (ledger = source of truth for total points)
-- ---------------------------------------------------------------------
create table if not exists public.point_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  delta       integer not null,            -- +earned / -redeemed
  reason      text,
  source_type public.point_source not null default 'adjustment',
  source_id   uuid,
  created_at  timestamptz not null default now()
);
create index if not exists idx_point_tx_user on public.point_transactions(user_id);

-- ---------------------------------------------------------------------
-- Reward catalogs + join tables
-- ---------------------------------------------------------------------
create table if not exists public.badges (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  name               text not null,
  description        text,
  icon               text,
  criteria_type      public.badge_criteria not null,
  criteria_threshold integer not null default 0,
  created_at         timestamptz not null default now()
);

create table if not exists public.user_badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   uuid not null references public.badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.rewards (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  name           text not null,
  description    text,
  points_required integer not null,
  category       public.reward_category not null,
  icon           text,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reward_id   uuid not null references public.rewards(id) on delete restrict,
  points_spent integer not null,
  status      public.redemption_status not null default 'pending',
  redeemed_at timestamptz not null default now()
);
create index if not exists idx_redemptions_user on public.reward_redemptions(user_id);

create table if not exists public.tiers (
  code       public.member_tier primary key,
  label      text not null,
  min_points integer not null,
  sort_order integer not null default 0
);

create table if not exists public.tier_benefits (
  id         uuid primary key default gen_random_uuid(),
  tier_code  public.member_tier not null references public.tiers(code) on delete cascade,
  benefit    text not null,
  sort_order integer not null default 0,
  unique (tier_code, benefit)
);
create index if not exists idx_tier_benefits_tier on public.tier_benefits(tier_code, sort_order);

-- ---------------------------------------------------------------------
-- Redefine v_event_public with REAL aggregates (donations + registrations
-- now exist). Same columns/types/order as the Phase 1 placeholder version.
-- ---------------------------------------------------------------------
create or replace view public.v_event_public as
select
  e.*,
  coalesce(d.amount_raised, 0)::bigint     as amount_raised,
  coalesce(r.participant_count, 0)::int    as participant_count,
  case
    when e.volunteer_spots is null then null
    else greatest(e.volunteer_spots - coalesce(r.participant_count, 0), 0)
  end                                      as spots_left
from public.events e
left join lateral (
  select sum(amount) as amount_raised
  from public.donations dn
  where dn.event_id = e.id and dn.status = 'completed' and dn.deleted_at is null
) d on true
left join lateral (
  select count(*)::int as participant_count
  from public.event_registrations er
  where er.event_id = e.id and er.status <> 'cancelled'
) r on true
where e.deleted_at is null;

-- ---------------------------------------------------------------------
-- View: v_member_dashboard — the dashboard UserData shape
-- ---------------------------------------------------------------------
create or replace view public.v_member_dashboard
with (security_invoker = true) as
select
  p.id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.profile_type,
  p.role,
  u.email,
  coalesce(pts.total_points, 0)                                   as total_points,
  coalesce(don.total_donated, 0)                                  as total_donated,
  coalesce(reg.events_attended, 0)                                as events_attended,
  coalesce(reg.hours_volunteered, 0)                              as hours_volunteered,
  coalesce(
    p.tier_override,
    (select t.code from public.tiers t
       where t.min_points <= coalesce(pts.total_points, 0)
       order by t.min_points desc limit 1),
    'bronze'
  )                                                               as tier
from public.profiles p
left join auth.users u on u.id = p.id
left join lateral (
  select sum(delta)::int as total_points
  from public.point_transactions pt where pt.user_id = p.id
) pts on true
left join lateral (
  select sum(amount)::bigint as total_donated
  from public.donations d
  where d.user_id = p.id and d.status = 'completed' and d.deleted_at is null
) don on true
left join lateral (
  select
    count(*) filter (where status = 'attended')::int as events_attended,
    coalesce(sum(hours_logged), 0)                    as hours_volunteered
  from public.event_registrations er where er.user_id = p.id
) reg on true;

-- ---------------------------------------------------------------------
-- RLS — owner-scoped on user-owned tables; public read on catalogs
-- ---------------------------------------------------------------------
alter table public.profiles               enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.event_registrations    enable row level security;
alter table public.event_donation_tiers   enable row level security;
alter table public.recurring_donations     enable row level security;
alter table public.donations               enable row level security;
alter table public.point_transactions      enable row level security;
alter table public.badges                  enable row level security;
alter table public.user_badges             enable row level security;
alter table public.rewards                 enable row level security;
alter table public.reward_redemptions      enable row level security;
alter table public.tiers                   enable row level security;
alter table public.tier_benefits           enable row level security;

drop policy if exists "profiles owner read"   on public.profiles;
create policy "profiles owner read"   on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "notif owner all" on public.notification_preferences;
create policy "notif owner all" on public.notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "registrations owner read" on public.event_registrations;
create policy "registrations owner read" on public.event_registrations for select using (auth.uid() = user_id);

drop policy if exists "donation_tiers public read" on public.event_donation_tiers;
create policy "donation_tiers public read" on public.event_donation_tiers for select using (true);

drop policy if exists "recurring owner all" on public.recurring_donations;
create policy "recurring owner all" on public.recurring_donations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "donations owner read" on public.donations;
create policy "donations owner read" on public.donations for select using (auth.uid() = user_id);

drop policy if exists "points owner read" on public.point_transactions;
create policy "points owner read" on public.point_transactions for select using (auth.uid() = user_id);

drop policy if exists "user_badges owner read" on public.user_badges;
create policy "user_badges owner read" on public.user_badges for select using (auth.uid() = user_id);

drop policy if exists "redemptions owner read" on public.reward_redemptions;
create policy "redemptions owner read" on public.reward_redemptions for select using (auth.uid() = user_id);

drop policy if exists "badges public read" on public.badges;
create policy "badges public read" on public.badges for select using (true);
drop policy if exists "rewards public read" on public.rewards;
create policy "rewards public read" on public.rewards for select using (active = true);
drop policy if exists "tiers public read" on public.tiers;
create policy "tiers public read" on public.tiers for select using (true);
drop policy if exists "tier_benefits public read" on public.tier_benefits;
create policy "tier_benefits public read" on public.tier_benefits for select using (true);

-- ---------------------------------------------------------------------
-- RPCs (security definer) — privileged, atomic operations
-- ---------------------------------------------------------------------

-- Register the current user for an event (members only). Returns registration id.
create or replace function public.register_for_event(p_event_id uuid, p_role public.registration_role default 'attendee')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_reg  uuid;
  v_spots int;
  v_taken int;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.events e where e.id = p_event_id and e.status <> 'draft' and e.deleted_at is null) then
    raise exception 'event not available';
  end if;

  select volunteer_spots into v_spots from public.events where id = p_event_id;
  if v_spots is not null then
    select count(*) into v_taken from public.event_registrations
      where event_id = p_event_id and status <> 'cancelled';
    if v_taken >= v_spots then raise exception 'event is full'; end if;
  end if;

  insert into public.event_registrations (user_id, event_id, role)
  values (v_user, p_event_id, p_role)
  on conflict (user_id, event_id) do update set status = 'registered', updated_at = now()
  returning id into v_reg;

  return v_reg;
end;
$$;

-- Redeem a reward for the current user (atomic points check + ledger debit).
create or replace function public.redeem_reward(p_reward_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_cost int;
  v_balance int;
  v_redemption uuid;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  select points_required into v_cost from public.rewards where id = p_reward_id and active = true;
  if v_cost is null then raise exception 'reward not available'; end if;

  select coalesce(sum(delta), 0) into v_balance from public.point_transactions where user_id = v_user;
  if v_balance < v_cost then raise exception 'insufficient points'; end if;

  insert into public.reward_redemptions (user_id, reward_id, points_spent, status)
  values (v_user, p_reward_id, v_cost, 'pending')
  returning id into v_redemption;

  insert into public.point_transactions (user_id, delta, reason, source_type, source_id)
  values (v_user, -v_cost, 'Reward redemption', 'redemption', v_redemption);

  return v_redemption;
end;
$$;

-- Award points (service-role / admin only — NOT user-callable).
create or replace function public.award_points(
  p_user uuid, p_delta int, p_reason text,
  p_source_type public.point_source default 'adjustment', p_source_id uuid default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.point_transactions (user_id, delta, reason, source_type, source_id)
  values (p_user, p_delta, p_reason, p_source_type, p_source_id)
  returning id into v_id;
  return v_id;
end;
$$;

-- Execute privileges
revoke all on function public.register_for_event(uuid, public.registration_role) from public;
revoke all on function public.redeem_reward(uuid) from public;
revoke all on function public.award_points(uuid, int, text, public.point_source, uuid) from public;
grant execute on function public.register_for_event(uuid, public.registration_role) to authenticated;
grant execute on function public.redeem_reward(uuid) to authenticated;
grant execute on function public.award_points(uuid, int, text, public.point_source, uuid) to service_role;

-- ---------------------------------------------------------------------
-- Seed — tiers, tier benefits, badges, rewards (from FE mock catalogs)
-- ---------------------------------------------------------------------
insert into public.tiers (code, label, min_points, sort_order) values
  ('bronze','Bronze',0,1),
  ('silver','Silver',200,2),
  ('gold','Gold',500,3),
  ('platinum','Platinum',1000,4)
on conflict (code) do nothing;

insert into public.tier_benefits (tier_code, benefit, sort_order) values
  ('bronze','Access to community events',1),
  ('bronze','Monthly newsletter',2),
  ('bronze','Digital membership card',3),
  ('silver','All Bronze benefits',1),
  ('silver','Early event registration',2),
  ('silver','5% partner store discount',3),
  ('silver','Quarterly impact reports',4),
  ('gold','All Silver benefits',1),
  ('gold','Priority volunteer placement',2),
  ('gold','10% partner store discount',3),
  ('gold','Invitation to donor appreciation events',4),
  ('platinum','All Gold benefits',1),
  ('platinum','Personal impact coordinator',2),
  ('platinum','15% partner store discount',3),
  ('platinum','VIP seating at all events',4),
  ('platinum','Annual recognition ceremony',5)
on conflict (tier_code, benefit) do nothing;

insert into public.badges (code, name, description, icon, criteria_type, criteria_threshold) values
  ('first-event','First Steps','Attended your first event','Calendar','events_attended',1),
  ('five-events','Community Regular','Attended 5 events','Users','events_attended',5),
  ('ten-events','Community Champion','Attended 10 events','Trophy','events_attended',10),
  ('first-donation','Generous Heart','Made your first donation','Heart','donations_made',1),
  ('monthly-donor','Sustained Supporter','Donated 3 months in a row','Sparkles','consecutive_months',3),
  ('volunteer-star','Volunteer Star','Volunteered 50+ hours','Star','hours_volunteered',50)
on conflict (code) do nothing;

insert into public.rewards (code, name, description, points_required, category, icon) values
  ('partner-discount','Partner Store Discount','10% off at participating local stores',250,'discount','Gift'),
  ('exclusive-event','Exclusive Event Access','VIP access to our annual gala dinner',500,'experience','Star'),
  ('merch-voucher','Merchandise Voucher','HK$100 voucher for Ultimate United merch',300,'merch','Gift'),
  ('recognition-wall','Recognition Wall Feature','Your name featured on our donor wall',1000,'recognition','Award')
on conflict (code) do nothing;
