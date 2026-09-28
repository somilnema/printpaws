-- Customer pet photos. The checkout only keeps a public Storage URL.
-- Run this once in the Supabase SQL editor if browser uploads are rejected.

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
