-- ---------------------------------------------------------------------
-- User-created activities: ownership, admin-approval gate, and a 5-active quota.
--
-- A "user activity" is an ordinary row in `events` with `owner_id` set to the
-- creator. Org/admin events keep `owner_id = null` and bypass review entirely.
-- An owned event is only public once an admin approves it (review_status).
--
-- Defense-in-depth: RLS scopes owner reads/writes, a BEFORE INSERT trigger caps
-- the quota authoritatively, and a column-guard trigger stops owners escalating
-- (review_status / featured / points_reward / owner_id / organizer_id).
-- ---------------------------------------------------------------------

-- review lifecycle for owned events; org/admin events are seeded 'approved'.
do $$ begin
  create type public.review_status as enum
    ('draft','pending','approved','rejected','changes_requested');
exception when duplicate_object then null; end $$;

alter table public.events
  add column if not exists owner_id      uuid references auth.users(id) on delete set null,
  add column if not exists review_status public.review_status not null default 'draft',
  add column if not exists review_note   text;

-- Existing events predate ownership → org events, already public, mark approved.
update public.events set review_status = 'approved' where owner_id is null;

create index if not exists idx_events_owner
  on public.events(owner_id) where deleted_at is null;
create index if not exists idx_events_review_status
  on public.events(review_status) where deleted_at is null;

-- Shared organizer that fronts every user activity (funds settle to the platform
-- org; the creator's name is surfaced separately via their profile).
insert into public.organizers (slug, name, mission, is_verified)
values ('community', 'Community Fundraisers',
        'Activities started by members of our community.', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- RLS — owners see/edit only their own rows; the public read now also
-- excludes owned events that have not been approved.
-- ---------------------------------------------------------------------
drop policy if exists "events public read" on public.events;
create policy "events public read" on public.events
  for select using (
    status <> 'draft'
    and deleted_at is null
    and (owner_id is null or review_status = 'approved')
  );

drop policy if exists "events owner read" on public.events;
create policy "events owner read" on public.events
  for select using (owner_id = auth.uid());

drop policy if exists "events owner insert" on public.events;
create policy "events owner insert" on public.events
  for insert with check (owner_id = auth.uid());

drop policy if exists "events owner update" on public.events;
create policy "events owner update" on public.events
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Section visibility mirrors the event: public only for approved/org events,
-- plus owners can read/write the sections of their own events.
drop policy if exists "event_sections public read" on public.event_sections;
create policy "event_sections public read" on public.event_sections
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_sections.event_id
        and e.status <> 'draft' and e.deleted_at is null
        and (e.owner_id is null or e.review_status = 'approved')
    )
  );

drop policy if exists "event_sections owner write" on public.event_sections;
create policy "event_sections owner write" on public.event_sections
  for all
  using (exists (select 1 from public.events e
                 where e.id = event_sections.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from public.events e
                      where e.id = event_sections.event_id and e.owner_id = auth.uid()));

-- ---------------------------------------------------------------------
-- Quota: at most 5 active (non-cancelled, non-deleted) events per owner.
-- ---------------------------------------------------------------------
create or replace function public.enforce_activity_quota()
returns trigger language plpgsql as $$
begin
  if new.owner_id is not null and (
    select count(*) from public.events e
    where e.owner_id = new.owner_id
      and e.status <> 'cancelled'
      and e.deleted_at is null
  ) >= 5 then
    raise exception 'Activity limit reached (max 5 active).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_events_quota on public.events;
create trigger trg_events_quota before insert on public.events
  for each row execute function public.enforce_activity_quota();

-- ---------------------------------------------------------------------
-- Column guard: owners (non-service-role writers) cannot escalate. The backend
-- uses the service role for approve/reject/submit, so those still work.
-- ---------------------------------------------------------------------
create or replace function public.guard_activity_columns()
returns trigger language plpgsql as $$
begin
  if old.owner_id is not null and coalesce(auth.role(), '') <> 'service_role' then
    new.review_status := old.review_status;
    new.owner_id      := old.owner_id;
    new.organizer_id  := old.organizer_id;
    new.featured      := old.featured;
    new.points_reward := old.points_reward;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_events_guard on public.events;
create trigger trg_events_guard before update on public.events
  for each row execute function public.guard_activity_columns();
