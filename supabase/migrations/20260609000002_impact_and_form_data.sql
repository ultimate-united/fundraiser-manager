-- Two additions:
--   1) events.impact      — editable "Your impact" tiers shown on the donate page.
--   2) event_registrations.form_data — captured sign-up fields (string->string)
--      until a dedicated form-builder exists.
-- Both idempotent.

alter table public.events
  add column if not exists impact jsonb not null default '[]'::jsonb;

alter table public.event_registrations
  add column if not exists form_data jsonb not null default '{}'::jsonb;

-- Seed impact tiers for the existing demo events (admins edit these later).
update public.events set impact = '[
  {"amount":50,"title":"Educational Materials","description":"Provides textbooks and school supplies for one student for a semester"},
  {"amount":100,"title":"Workshop Access","description":"Sponsors one child to attend our educational workshop series"},
  {"amount":250,"title":"Family Support","description":"Provides emergency assistance to a family in need for one month"},
  {"amount":500,"title":"Community Program","description":"Funds a community outreach program session reaching 20+ families"}
]'::jsonb
where slug in ('run-for-hope-2026', 'mothers-day-celebration-2026', 'summer-learning-camp-2026')
  and (impact is null or impact = '[]'::jsonb);
