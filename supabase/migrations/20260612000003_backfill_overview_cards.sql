-- Backfill the default Overview info-cards into existing events whose Overview
-- section has no cards yet (created with empty items by 20260612000002). Keeps the
-- previously-hardcoded "Who Should Join / What to Expect / Impact" content as data.
-- Mirrors backend DEFAULT_SECTIONS. Idempotent (only fills empty item arrays).
update public.event_sections
set content = jsonb_set(
  content,
  '{items}',
  '[
    {"icon":"users","title":"Who Should Join","body":"Anyone passionate about making a difference in our community. Families, individuals, and corporate teams are all welcome."},
    {"icon":"heart","title":"What to Expect","body":"A day filled with meaningful activities, community bonding, and the joy of giving back."},
    {"icon":"building","title":"Impact","body":"100% of funds raised go directly to supporting the communities we serve."}
  ]'::jsonb
)
where kind = 'rich_text'
  and jsonb_array_length(coalesce(content->'items', '[]'::jsonb)) = 0;
