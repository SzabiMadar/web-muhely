-- Műhely Workspace — core schema (W1)
-- Egyfelhasználós munkatér: minden sor owner_id-hez kötött, RLS védi.
-- Jelszót, tokent, privát kulcsot soha nem tárolunk — csak hivatkozást.

-- ─── Ügyfelek ───────────────────────────────────────────────────────────────

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 200),
  company_name  text,
  contact_name  text,
  email         text,
  phone         text,
  address_text  text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, owner_id)
);

alter table public.clients enable row level security;

create policy "clients: owner only" on public.clients
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index clients_owner_idx on public.clients (owner_id);

-- ─── Projektek ──────────────────────────────────────────────────────────────

create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id) on delete cascade,
  client_id        uuid not null,
  title            text not null check (char_length(title) between 1 and 200),
  work_type        text not null check (work_type in ('new_site', 'redesign', 'small_change')),
  status           text not null default 'active'
                     check (status in ('draft', 'active', 'paused', 'delivered', 'archived', 'cancelled')),
  scope_md         text,
  requirements_md  text,
  due_date         date,
  closure_notes    text,
  feedback_notes   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, owner_id),
  constraint projects_client_owner_fk
    foreign key (client_id, owner_id)
    references public.clients (id, owner_id)
    on delete restrict
);

alter table public.projects enable row level security;

create policy "projects: owner only" on public.projects
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index projects_owner_idx on public.projects (owner_id);
create index projects_client_idx on public.projects (client_id);

-- ─── Projektfázisok ─────────────────────────────────────────────────────────

create table public.project_phases (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  project_id   uuid not null,
  phase_code   text not null check (phase_code in ('01','02','03','04','05','06','07','08','09','10','11')),
  status       text not null default 'not_started'
                 check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at   timestamptz,
  completed_at timestamptz,
  unique (project_id, phase_code),
  constraint project_phases_owner_fk
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

alter table public.project_phases enable row level security;

create policy "project_phases: owner only" on public.project_phases
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index project_phases_project_idx on public.project_phases (project_id);

-- ─── Projektchecklist / QA ──────────────────────────────────────────────────

create table public.project_tasks (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users (id) on delete cascade,
  project_id        uuid not null,
  phase_code        text not null check (phase_code in ('01','02','03','04','05','06','07','08','09','10','11')),
  template_item_key text,
  label             text not null check (char_length(label) between 1 and 300),
  status            text not null default 'todo'
                      check (status in ('todo', 'in_progress', 'done', 'skipped')),
  verification      text not null default 'not_tested'
                      check (verification in ('not_tested', 'passed', 'failed', 'not_applicable')),
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint project_tasks_owner_fk
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

alter table public.project_tasks enable row level security;

create policy "project_tasks: owner only" on public.project_tasks
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index project_tasks_project_idx on public.project_tasks (project_id);

-- ─── Projekt-erőforrások (link / fájl / hozzáférés) ────────────────────────

create table public.project_resources (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  project_id  uuid not null,
  kind        text not null check (kind in ('link', 'file', 'access')),
  provider    text,
  label       text not null check (char_length(label) between 1 and 200),
  url         text,
  object_path text,
  username    text,
  vault_ref   text,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint project_resources_owner_fk
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

alter table public.project_resources enable row level security;

create policy "project_resources: owner only" on public.project_resources
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index project_resources_project_idx on public.project_resources (project_id);

-- ─── Jegyzetek ──────────────────────────────────────────────────────────────

create table public.project_notes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null,
  phase_code text check (phase_code in ('01','02','03','04','05','06','07','08','09','10','11')),
  title      text not null check (char_length(title) between 1 and 200),
  body_md    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_notes_owner_fk
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

alter table public.project_notes enable row level security;

create policy "project_notes: owner only" on public.project_notes
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index project_notes_project_idx on public.project_notes (project_id);

-- ─── Riportok ───────────────────────────────────────────────────────────────

create table public.project_reports (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null,
  kind       text not null check (kind in ('handover', 'summary')),
  content_md text not null,
  created_at timestamptz not null default now(),
  constraint project_reports_owner_fk
    foreign key (project_id, owner_id)
    references public.projects (id, owner_id)
    on delete cascade
);

alter table public.project_reports enable row level security;

create policy "project_reports: owner only" on public.project_reports
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index project_reports_project_idx on public.project_reports (project_id);

-- ─── updated_at trigger ─────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger project_tasks_updated_at before update on public.project_tasks
  for each row execute function public.set_updated_at();
create trigger project_resources_updated_at before update on public.project_resources
  for each row execute function public.set_updated_at();
create trigger project_notes_updated_at before update on public.project_notes
  for each row execute function public.set_updated_at();
