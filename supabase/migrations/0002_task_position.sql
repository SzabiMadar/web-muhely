-- W2: feladatok stabil sorrendje a sablon-template sorrend szerint.

alter table public.project_tasks
  add column if not exists position int not null default 0;

create index if not exists project_tasks_order_idx
  on public.project_tasks (project_id, phase_code, position);
