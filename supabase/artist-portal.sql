-- Not used by the app.
-- Run supabase/order-system.sql instead. That is the script the order system reads.

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

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

alter table public.artists enable row level security;
alter table public.order_updates enable row level security;

notify pgrst, 'reload schema';
