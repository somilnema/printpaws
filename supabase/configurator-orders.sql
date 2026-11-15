-- Multi-Pet and You & Your Pet orders: structured configurator details.
-- Holds the pet-to-photo mapping, group / reference photos, composition, pet names, halo target
-- and artist instructions, so production never has to guess from a text field.
-- Safe to run more than once. Run it BEFORE selling Multi-Pet / You & Your Pet: until it exists, those orders are
-- refused before payment (an order that is already paid is still saved, with these details on its timeline).

alter table public.orders
  add column if not exists order_details jsonb;

comment on column public.orders.order_details is
  'Configurator details for Multi-Pet / You & Your Pet orders (photo_assets with roles and pet ids, names, halo, artist_instructions).';

notify pgrst, 'reload schema';
