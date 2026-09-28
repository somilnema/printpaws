-- Peternity order system.
-- Run this once in the Supabase SQL editor.
-- Artwork status, versions, deadlines, the audit history, and the email log
-- live here with the storefront orders. The app no longer uses data/portal.db.

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

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

alter table public.artists enable row level security;
alter table public.order_workflow enable row level security;
alter table public.artwork_versions enable row level security;
alter table public.order_events enable row level security;
alter table public.email_log enable row level security;

notify pgrst, 'reload schema';
