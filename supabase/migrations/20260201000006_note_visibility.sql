-- W4 javítás: megosztható jegyzetek az ügyfél-riporthoz.

alter table public.project_notes
  add column if not exists client_visible boolean not null default false;
