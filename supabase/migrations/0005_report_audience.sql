-- W4 javítás: a mentett riportok közönség-jelölése (ügyfélnek átadható vs belső).

alter table public.project_reports
  add column if not exists audience text not null default 'client'
  check (audience in ('client', 'internal'));
