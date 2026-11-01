import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client, Project, ProjectPhase } from '../types';

export interface ClientWithCount extends Client {
  project_count: number;
}

export interface ProjectWithClient extends Project {
  client: Pick<Client, 'id' | 'display_name'> | null;
  phases: ProjectPhase[];
}

export async function listClients(supabase: SupabaseClient, query?: string): Promise<ClientWithCount[]> {
  let request = supabase
    .from('clients')
    .select('*')
    .order('updated_at', { ascending: false });

  if (query) {
    request = request.or(`display_name.ilike.%${query}%,company_name.ilike.%${query}%`);
  }

  const { data: clients, error } = await request;
  if (error) throw new Error(error.message);

  const ids = (clients ?? []).map((client) => client.id);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: projects } = await supabase.from('projects').select('client_id').in('client_id', ids);
    for (const row of projects ?? []) {
      counts.set(row.client_id, (counts.get(row.client_id) ?? 0) + 1);
    }
  }

  return (clients ?? []).map((client) => ({ ...client, project_count: counts.get(client.id) ?? 0 }));
}

export async function getClient(supabase: SupabaseClient, id: string): Promise<Client | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listClientProjects(supabase: SupabaseClient, clientId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface ListProjectsOptions {
  query?: string;
  status?: string;
  limit?: number;
}

export async function listProjects(
  supabase: SupabaseClient,
  options: ListProjectsOptions = {},
): Promise<ProjectWithClient[]> {
  let request = supabase
    .from('projects')
    .select('*, client:clients(id, display_name)')
    .order('updated_at', { ascending: false });

  if (options.query) request = request.ilike('title', `%${options.query}%`);
  if (options.status) request = request.eq('status', options.status);
  if (options.limit) request = request.limit(options.limit);

  const { data: projects, error } = await request;
  if (error) throw new Error(error.message);
  if (!projects || projects.length === 0) return [];

  const { data: phases } = await supabase
    .from('project_phases')
    .select('*')
    .in('project_id', projects.map((project) => project.id));

  const byProject = new Map<string, ProjectPhase[]>();
  for (const phase of phases ?? []) {
    const list = byProject.get(phase.project_id) ?? [];
    list.push(phase);
    byProject.set(phase.project_id, list);
  }

  return projects.map((project) => ({
    ...project,
    phases: (byProject.get(project.id) ?? []).sort((a, b) => a.phase_code.localeCompare(b.phase_code)),
  }));
}

export async function getProjectOverview(
  supabase: SupabaseClient,
  id: string,
): Promise<ProjectWithClient | null> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, client:clients(id, display_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!project) return null;

  const { data: phases, error: phasesError } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', id)
    .order('phase_code');
  if (phasesError) throw new Error(phasesError.message);

  return { ...project, phases: phases ?? [] };
}

export async function listProjectTasks(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('phase_code')
    .order('position');
  if (error) throw new Error(error.message);
  return (data ?? []) as import('../types').ProjectTask[];
}

export function nextOpenTask<T extends { status: string }>(tasks: readonly T[]): T | null {
  return tasks.find((t) => t.status === 'in_progress') ?? tasks.find((t) => t.status === 'todo') ?? null;
}

export async function listProjectResources(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('project_resources')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as import('../types').ProjectResource[];
}

export async function signedFileUrl(supabase: SupabaseClient, objectPath: string) {
  const { data } = await supabase.storage.from('project-files').createSignedUrl(objectPath, 60 * 10);
  return data?.signedUrl ?? null;
}

export async function listProjectNotes(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('project_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as import('../types').ProjectNote[];
}

export async function listProjectReports(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('project_reports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as import('../types').ProjectReport[];
}

export async function getProjectReport(supabase: SupabaseClient, projectId: string, reportId: string) {
  const { data, error } = await supabase
    .from('project_reports')
    .select('*')
    .eq('id', reportId)
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as import('../types').ProjectReport | null;
}
