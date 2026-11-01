export type WorkType = 'new_site' | 'redesign' | 'small_change';
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'delivered' | 'archived' | 'cancelled';
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped';
export type TaskVerification = 'not_tested' | 'passed' | 'failed' | 'not_applicable';
export type ResourceKind = 'link' | 'file' | 'access';

export interface Client {
  id: string;
  owner_id: string;
  display_name: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  client_id: string;
  title: string;
  work_type: WorkType;
  status: ProjectStatus;
  scope_md: string | null;
  requirements_md: string | null;
  due_date: string | null;
  closure_notes: string | null;
  feedback_notes: string | null;
  closed_at: string | null;
  invoice_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  owner_id: string;
  project_id: string;
  phase_code: string;
  status: PhaseStatus;
  started_at: string | null;
  completed_at: string | null;
}

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  new_site: 'Új weboldal',
  redesign: 'Felújítás',
  small_change: 'Kisebb fejlesztés',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Tervezés alatt',
  active: 'Aktív',
  paused: 'Függőben',
  delivered: 'Átadva',
  archived: 'Archivált',
  cancelled: 'Törölve',
};

export interface ProjectTask {
  id: string;
  owner_id: string;
  project_id: string;
  phase_code: string;
  template_item_key: string | null;
  label: string;
  status: TaskStatus;
  verification: TaskVerification;
  note: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectResource {
  id: string;
  owner_id: string;
  project_id: string;
  kind: 'link' | 'file' | 'access';
  provider: string | null;
  label: string;
  url: string | null;
  object_path: string | null;
  username: string | null;
  vault_ref: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  owner_id: string;
  project_id: string;
  phase_code: string | null;
  title: string;
  body_md: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectReport {
  id: string;
  owner_id: string;
  project_id: string;
  kind: 'handover' | 'summary';
  audience: 'client' | 'internal';
  content_md: string;
  created_at: string;
}
