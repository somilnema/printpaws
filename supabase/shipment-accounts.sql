-- Shipment desk accounts created from admin.
-- Run this once in the Supabase SQL editor if setup-all.sql was already applied.

create table if not exists public.shippers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.shippers enable row level security;

notify pgrst, 'reload schema';
