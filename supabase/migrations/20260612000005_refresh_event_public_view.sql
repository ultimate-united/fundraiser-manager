-- ---------------------------------------------------------------------
-- Refresh v_event_public so it exposes the columns added in 20260612000004
-- (owner_id, review_status, review_note). The view was defined with `SELECT
-- e.*`, which freezes the column list at creation time, so the new columns
-- were NOT picked up automatically. A plain CREATE OR REPLACE can't reorder
-- columns (the new ones land mid-list, before the computed aggregates), so we
-- drop and recreate. Definition is otherwise identical to 20260602000002.
-- ---------------------------------------------------------------------
drop view if exists public.v_event_public;

create view public.v_event_public as
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
