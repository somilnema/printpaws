-- Prices and coupons for the admin portal.
-- Run this once in the Supabase SQL editor.
-- Orders already placed keep the amount stored on the order.
-- New checkouts read these tables.

create table if not exists public.price_items (
  key text primary key,
  amount integer not null check (amount >= 0),
  compare_at integer check (compare_at is null or compare_at >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  min_order_amount integer check (min_order_amount is null or min_order_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  once_per_customer boolean not null default false,
  applies_to text[] not null default array['all']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_unique unique (code),
  constraint coupons_percent_max check (discount_type <> 'percent' or discount_value <= 100),
  constraint coupons_dates check (starts_at is null or ends_at is null or ends_at > starts_at),
  constraint coupons_applies_to_known check (
    applies_to <@ array['all', 'portrait', 'mug', 'magnet', 'digital']::text[]
    and cardinality(applies_to) > 0
  )
);

alter table public.price_items enable row level security;
alter table public.coupons enable row level security;

insert into public.price_items (key, amount, compare_at) values
  ('framed_8x10', 1499, null),
  ('framed_12x16', 1999, null),
  ('framed_18x24', 2499, null),
  ('canvas_8x12', 1699, null),
  ('canvas_16x20', 2499, null),
  ('canvas_20x30', 3499, null),
  ('pets_two', 300, null),
  ('pets_three', 600, null),
  ('pets_four', 1500, null),
  ('addon_halo', 200, null),
  ('addon_gift_wrap', 99, null),
  ('addon_premium_bg', 199, null),
  ('extra_mug', 600, 799),
  ('extra_magnet', 200, 299),
  ('extra_digital', 300, 399),
  ('rule_prepaid_percent', 4, null),
  ('rule_cod_advance_percent', 40, null),
  ('pay_custom_a', 500, null),
  ('pay_custom_b', 600, null),
  ('pay_fresh', 200, null),
  ('pay_digital_a', 300, null),
  ('pay_digital_b', 500, null)
on conflict (key) do nothing;

insert into public.coupons (code, discount_type, discount_value, active, applies_to)
values ('WELCOME10', 'percent', 10, true, array['all']::text[])
on conflict (code) do nothing;

notify pgrst, 'reload schema';
