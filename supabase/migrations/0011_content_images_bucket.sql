-- Create a public storage bucket for CMS content images (hero images, inline images).
insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;

-- Anyone can read (images are public on the site).
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'content-images');

-- Only admins can upload / update / delete.
create policy "Admins can upload content images" on storage.objects
  for insert with check (
    bucket_id = 'content-images'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "Admins can update content images" on storage.objects
  for update using (
    bucket_id = 'content-images'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "Admins can delete content images" on storage.objects
  for delete using (
    bucket_id = 'content-images'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
