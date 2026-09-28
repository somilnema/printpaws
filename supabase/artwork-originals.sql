-- Private bucket for the print file. The customer only receives the watermarked preview.
-- The app also creates this bucket on the first artwork upload.
insert into storage.buckets (id, name, public)
values ('artwork-originals', 'artwork-originals', false)
on conflict (id) do update set public = false;
