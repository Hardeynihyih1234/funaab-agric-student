-- Storage buckets and policies
-- Create these in Supabase Storage or run via SQL if storage schema is available.
-- Safe to re-run: buckets are upserted and policies are dropped before they are created.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'academic-materials',
    'academic-materials',
    false,
    26214400,
    array['application/pdf']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read academic materials" on storage.objects;
create policy "Authenticated users can read academic materials"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'academic-materials');

drop policy if exists "Admins can upload academic materials" on storage.objects;
create policy "Admins can upload academic materials"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'academic-materials'
    and public.is_admin()
    and (storage.extension(name) = 'pdf')
  );

drop policy if exists "Admins can update academic materials" on storage.objects;
create policy "Admins can update academic materials"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'academic-materials' and public.is_admin())
  with check (bucket_id = 'academic-materials' and public.is_admin());

drop policy if exists "Admins can delete academic materials" on storage.objects;
create policy "Admins can delete academic materials"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'academic-materials' and public.is_admin());

drop policy if exists "Anyone can read avatars" on storage.objects;
create policy "Anyone can read avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
