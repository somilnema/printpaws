-- Phase 2 operations: private team notes, editable emails, vendor API log.
-- Run this once in the Supabase SQL editor after order-system.sql.

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

alter table public.team_notes enable row level security;
alter table public.email_templates enable row level security;
alter table public.vendor_settings enable row level security;
alter table public.vendor_attempts enable row level security;

notify pgrst, 'reload schema';
