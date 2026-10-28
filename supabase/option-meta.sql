-- Option visibility for the product customizer (styles, sizes, pets).
-- Run once in the Supabase SQL editor if price_items already exists.
-- Status: available | hidden | out_of_stock
-- Hidden removes the choice from the shop. Out of stock shows it greyed out.

create table if not exists public.option_meta (
  key text primary key,
  status text not null default 'available'
    check (status in ('available', 'hidden', 'out_of_stock')),
  badge text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.option_meta enable row level security;

insert into public.option_meta (key, status, badge) values
  ('style_canvas', 'available', ''),
  ('style_framed', 'out_of_stock', ''),
  ('framed_8x10', 'available', ''),
  ('framed_12x16', 'available', '⭐ Most Popular'),
  ('framed_18x24', 'out_of_stock', ''),
  ('canvas_8x12', 'available', ''),
  ('canvas_16x20', 'available', ''),
  ('canvas_20x30', 'available', '💰 Value for Money'),
  ('pets_one', 'available', ''),
  ('pets_two', 'available', ''),
  ('pets_three', 'available', ''),
  ('pets_four', 'available', ''),
  ('pets_human', 'available', '')
on conflict (key) do nothing;

notify pgrst, 'reload schema';
