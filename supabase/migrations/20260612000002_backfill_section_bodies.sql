-- Move the previously-hardcoded tab body text into the DB so it's editable.
-- Legacy sections stored content as a bare items array; wrap it as { body, items }
-- with the default intro copy. Idempotent: the array updates only touch sections
-- still in the legacy array shape, so re-running is a no-op.

update public.event_sections
set content = jsonb_build_object(
  'body', 'Here''s what to expect throughout the day',
  'items', content
)
where kind = 'schedule' and jsonb_typeof(content) = 'array';

update public.event_sections
set content = jsonb_build_object(
  'body', 'There are many ways to support this event and make a difference',
  'items', content
)
where kind = 'contribution' and jsonb_typeof(content) = 'array';

update public.event_sections
set content = jsonb_build_object(
  'body', 'We are grateful to the organizations that make this event possible',
  'items', content
)
where kind = 'sponsors' and jsonb_typeof(content) = 'array';

-- Give each event an Overview (rich_text) section, body seeded from its summary.
insert into public.event_sections (event_id, kind, title, position, content, enabled)
select e.id, 'rich_text', 'About This Event', 0,
       jsonb_build_object('body', coalesce(e.summary, ''), 'items', '[]'::jsonb), true
from public.events e
where not exists (
  select 1 from public.event_sections s where s.event_id = e.id and s.kind = 'rich_text'
);
