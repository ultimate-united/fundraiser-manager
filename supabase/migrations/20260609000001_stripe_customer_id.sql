-- Phase 2 follow-up: store the Stripe Customer id on the profile so recurring
-- donors reuse one customer (and a future Customer Portal can manage subscriptions).
-- Idempotent.
alter table public.profiles add column if not exists stripe_customer_id text;
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
