-- W4: projektzárási metaadatok az átadáshoz.
-- (closure_notes és feedback_notes már a 0001 sémában léteznek.)

alter table public.projects
  add column if not exists closed_at timestamptz,
  add column if not exists invoice_ref text;
