-- Peternity / Print Paws — one-shot setup.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- public.orders must already exist. These scripts add workflow, pricing,
-- operations, and storage on top of that table.
-- Safe to re-run: tables use IF NOT EXISTS, inserts use ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------------
-- Artists (shared by the order workflow and the older portal columns)
-- ---------------------------------------------------------------------------

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Order columns from artist-portal.sql
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists artist_id uuid references public.artists (id) on delete set null;

alter table public.orders
  add column if not exists fulfillment_stage text not null default 'received';

alter table public.orders
  add column if not exists tracking_url text;

update public.orders
set fulfillment_stage = 'received'
where fulfillment_stage is null or fulfillment_stage = '';

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_phone_key'
  ) then
    alter table public.orders
      add column customer_phone_key text
      generated always as (
        right(regexp_replace(coalesce(customer_phone, ''), '\D', '', 'g'), 10)
      ) stored;
  end if;
end $$;

alter table public.orders drop constraint if exists orders_fulfillment_stage_check;
alter table public.orders
  add constraint orders_fulfillment_stage_check
  check (
    fulfillment_stage in (
      'received',
      'assigned',
      'preview_ready',
      'revision_requested',
      'printing',
      'shipped'
    )
  );

create index if not exists orders_customer_phone_key_idx
  on public.orders (customer_phone_key);

create index if not exists orders_artist_id_idx
  on public.orders (artist_id);

create table if not exists public.order_updates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('preview', 'revision', 'approved')),
  image_url text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_updates_order_id_idx
  on public.order_updates (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Order system: workflow, artwork versions, audit, email log
-- ---------------------------------------------------------------------------

create table if not exists public.order_workflow (
  order_id uuid primary key references public.orders (id) on delete cascade,
  status text not null,
  artist_id uuid references public.artists (id) on delete set null,
  sla_started_at timestamptz,
  due_at timestamptz,
  extension_reason text,
  extended_by text,
  extended_at timestamptz,
  tracking_url text,
  tracking_saved_by text,
  tracking_saved_at timestamptz,
  approved_update_id uuid,
  approved_at timestamptz,
  approved_by text,
  revision_count integer not null default 0,
  hold_reason text,
  cancel_reason text,
  status_before_hold text,
  delivered_at timestamptz,
  delivered_by text,
  needs_decision boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_workflow_status_check check (
    status in (
      'awaiting_images',
      'ready_for_artwork',
      'artwork_in_progress',
      'artwork_review',
      'revision_requested',
      'revision_in_progress',
      'final_approval',
      'shipped',
      'delivered',
      'on_hold',
      'cancelled'
    )
  ),
  constraint order_workflow_revision_count_check check (revision_count >= 0 and revision_count <= 2)
);

create table if not exists public.artwork_versions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('preview', 'revision', 'approved')),
  image_url text,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  actor text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  event_key text not null unique,
  event_type text not null,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists order_workflow_artist_idx on public.order_workflow (artist_id);
create index if not exists order_workflow_status_idx on public.order_workflow (status);
create index if not exists order_workflow_due_idx on public.order_workflow (due_at);
create index if not exists artwork_versions_order_idx on public.artwork_versions (order_id, created_at);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);
create index if not exists email_log_order_idx on public.email_log (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Operations: team notes, email templates, vendor settings and attempts
-- ---------------------------------------------------------------------------

create table if not exists public.team_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists team_notes_order_idx on public.team_notes (order_id, created_at);

create table if not exists public.email_templates (
  event_type text primary key,
  subject text not null,
  heading text not null default '',
  body text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.vendor_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default false,
  endpoint_url text not null default '',
  api_key text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.vendor_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.vendor_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null check (status in ('sent', 'failed')),
  tracking_url text,
  error text,
  attempted_by text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists vendor_attempts_order_idx on public.vendor_attempts (order_id, attempted_at desc);

-- ---------------------------------------------------------------------------
-- Store pricing and coupons
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Storage buckets and pet-photo policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('artwork-originals', 'artwork-originals', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read pet photos" on storage.objects;
create policy "Public read pet photos"
on storage.objects for select
to public
using (bucket_id = 'pet-photos');

drop policy if exists "Customers upload pet photos" on storage.objects;
create policy "Customers upload pet photos"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = 'orders'
);

-- ---------------------------------------------------------------------------
-- Shipment desk accounts
-- ---------------------------------------------------------------------------

create table if not exists public.shippers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.artists enable row level security;
alter table public.shippers enable row level security;
alter table public.order_updates enable row level security;
alter table public.order_workflow enable row level security;
alter table public.artwork_versions enable row level security;
alter table public.order_events enable row level security;
alter table public.email_log enable row level security;
alter table public.team_notes enable row level security;
alter table public.email_templates enable row level security;
alter table public.vendor_settings enable row level security;
alter table public.vendor_attempts enable row level security;
alter table public.price_items enable row level security;
alter table public.coupons enable row level security;

notify pgrst, 'reload schema';
