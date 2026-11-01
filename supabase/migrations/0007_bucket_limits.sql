-- W3 javítás: a project-files bucket védelme az upload API szintjén is
-- (méretkorlát + engedélyezett MIME-típusok — az alkalmazás-szabályzattal egyezően).

update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/markdown', 'text/csv'
  ]
where id = 'project-files';
