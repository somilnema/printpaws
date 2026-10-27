-- Landing cards the admin can create, price, and sell.
-- Run this once in the Supabase SQL editor. Safe to re-run.

create table if not exists public.landing_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text not null,
  image_url text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  kind text not null check (kind in ('portrait', 'fixed')),
  pets text check (pets is null or pets in ('one', 'two', 'human')),
  price integer check (price is null or price >= 0),
  for_sale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_products_slug_unique unique (slug),
  constraint landing_products_portrait_pets check (kind <> 'portrait' or pets is not null),
  constraint landing_products_fixed_sale check (
    kind <> 'fixed' or for_sale = false or (price is not null and price > 0)
  )
);

alter table public.landing_products enable row level security;

insert into public.landing_products (slug, name, description, sort_order, active, kind, pets, for_sale)
values
  ('everyday-pet-portrait', 'Everyday Pet Portrait', 'Turn your favourite pet photo into a beautiful portrait.', 0, true, 'portrait', 'one', true),
  ('multi-pet-portrait', 'Multi-Pet Portrait', 'All your pets together in one beautiful portrait.', 1, true, 'portrait', 'two', true),
  ('you-and-your-pet', 'You & Your Pet', 'A beautiful portrait of you and your furry best friend.', 2, true, 'portrait', 'human', true),
  ('memorial-portrait', 'Memorial Portrait', 'Honour their memory with a portrait you''ll cherish forever.', 3, true, 'portrait', 'one', true),
  ('signature-gift-bundle', 'Signature Gift Bundle', 'A special gift made for someone who loves their pet.', 4, true, 'fixed', null, false),
  ('mini-desk-portrait', 'Mini Desk Portrait', 'Your little companion, always by your side.', 5, true, 'fixed', null, false)
on conflict (slug) do nothing;

notify pgrst, 'reload schema';
