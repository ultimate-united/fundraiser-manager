-- =====================================================================
-- Phase 2 fix — v_member_dashboard must not join auth.users
-- Depends on 0002. Apply AFTER it.
--
-- Problem: 0002 defined v_member_dashboard with `security_invoker = true` and a
-- join to auth.users (for email). Neither `authenticated` nor `service_role`
-- has SELECT on auth.users, so ANY read of the view raised
-- `42501 permission denied for table users` — the dashboard endpoint was unusable.
--
-- Fix: drop the auth.users join and the `email` column. Email is sourced from the
-- caller's JWT in the backend instead (CurrentUser.email), so the view stays
-- security_invoker (RLS-respecting) and is readable by app roles.
--
-- Note: CREATE OR REPLACE VIEW cannot drop a column, so we DROP then CREATE.
-- =====================================================================

drop view if exists public.v_member_dashboard;

create view public.v_member_dashboard
with (security_invoker = true) as
select
  p.id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.profile_type,
  p.role,
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
