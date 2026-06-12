-- Per-tab show/hide toggle for event content sections (Overview is always shown;
-- Schedule / Contribute / Sponsors are optional per event). Idempotent.
alter table public.event_sections
  add column if not exists enabled boolean not null default true;
