-- W3 javítás: feltöltés csak létező, saját projekt alá (közvetlen Storage API-val is).
drop policy "project_files: owner write" on storage.objects;

create policy "project_files: owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.projects p
      where p.id = (storage.foldername(name))[2]::uuid
        and p.owner_id = auth.uid()
    )
  );

-- Bucket MIME-allowlist a végleges fájltípus-körhöz igazítva (.zip kizárva).
update storage.buckets
set allowed_mime_types = array[
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/markdown', 'text/csv'
]
where id = 'project-files';
