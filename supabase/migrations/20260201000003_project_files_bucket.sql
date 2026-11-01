-- W3: privát fájlstorage a projektdossziéhoz.
-- Objektumútvonal: {owner_id}/{project_id}/{fájlnév}

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

create policy "project_files: owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "project_files: owner write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "project_files: owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);
