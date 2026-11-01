import { ActionError, defineAction } from 'astro:actions';
import {
  clientInputSchema,
  clientUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  signInSchema,
} from '../lib/schemas';
import { PHASES } from '../lib/phases';
import { tasksForWorkType } from '../lib/playbook/templates';
import { FILE_BUCKET, MAX_FILE_SIZE_BYTES } from '../lib/resources';
import {
  closureSchema,
  noteDeleteSchema,
  noteSchema,
  noteUpdateSchema,
  reportGenerateSchema,
  resourceAccessSchema,
  resourceDeleteSchema,
  resourceLinkSchema,
  resourceUploadSchema,
} from '../lib/schemas';
import { buildHandoverMarkdown, resolveClosedAt } from '../lib/reporting/handover';
import { z } from 'zod';
import type { ActionAPIContext } from 'astro:actions';
import type { SupabaseClient, User } from '@supabase/supabase-js';

function requireUser(context: ActionAPIContext): { supabase: SupabaseClient; user: User } {
  const supabase = context.locals.supabase;
  const user = context.locals.user;
  if (!supabase || !user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Bejelentkezés szükséges.' });
  }
  return { supabase, user };
}

export const server = {
  auth: {
    signIn: defineAction({
      accept: 'form',
      input: signInSchema,
      handler: async (input, context) => {
        const supabase = context.locals.supabase;
        if (!supabase) {
          throw new ActionError({
            code: 'SERVICE_UNAVAILABLE',
            message: 'A Supabase kapcsolat nincs konfigurálva.',
          });
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });
        if (error) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'Hibás e-mail cím vagy jelszó.' });
        }
        return { ok: true };
      },
    }),

    signOut: defineAction({
      accept: 'form',
      handler: async (_input, context) => {
        const supabase = context.locals.supabase;
        if (supabase) await supabase.auth.signOut();
        return { ok: true };
      },
    }),
  },

  clients: {
    create: defineAction({
      accept: 'form',
      input: clientInputSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { data, error } = await supabase
          .from('clients')
          .insert({ ...input, owner_id: user.id })
          .select('id')
          .single();
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { clientId: data.id };
      },
    }),

    update: defineAction({
      accept: 'form',
      input: clientUpdateSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { id, ...fields } = input;
        const { data, error } = await supabase
          .from('clients')
          .update(fields)
          .eq('id', id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Az ügyfél nem található.' });
        }
        return { clientId: id };
      },
    }),
  },

  projects: {
    create: defineAction({
      accept: 'form',
      input: projectCreateSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);

        let clientId = input.client_id ?? null;
        if (input.client_mode === 'new') {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({ display_name: input.new_client_name!, owner_id: user.id })
            .select('id')
            .single();
          if (clientError) {
            throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: clientError.message });
          }
          clientId = client.id;
        }

        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            owner_id: user.id,
            client_id: clientId,
            title: input.title,
            work_type: input.work_type,
            scope_md: input.scope_md,
            requirements_md: input.requirements_md,
            due_date: input.due_date,
          })
          .select('id')
          .single();
        if (projectError) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: projectError.message });
        }

        const { error: phasesError } = await supabase.from('project_phases').insert(
          PHASES.map((phase) => ({
            owner_id: user.id,
            project_id: project.id,
            phase_code: phase.code,
          })),
        );
        if (phasesError) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: phasesError.message });
        }

        const { error: tasksError } = await supabase.from('project_tasks').insert(
          tasksForWorkType(input.work_type).map((task, index) => ({
            owner_id: user.id,
            project_id: project.id,
            phase_code: task.phase,
            template_item_key: task.key,
            label: task.label,
            position: index,
          })),
        );
        if (tasksError) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: tasksError.message });
        }

        return { projectId: project.id };
      },
    }),

    update: defineAction({
      accept: 'form',
      input: projectUpdateSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { id, ...fields } = input;
        if (fields.status) {
          const { data: current } = await supabase
            .from('projects')
            .select('closed_at')
            .eq('id', id)
            .maybeSingle();
          if (current) {
            (fields as Record<string, unknown>).closed_at = resolveClosedAt(current.closed_at, fields.status, new Date());
          }
        }
        const { data, error } = await supabase
          .from('projects')
          .update(fields)
          .eq('id', id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A projekt nem található.' });
        }
        return { projectId: id };
      },
    }),

    seedTasks: defineAction({
      accept: 'form',
      input: z.object({ project_id: z.uuid() }),
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id, work_type')
          .eq('id', input.project_id)
          .maybeSingle();
        if (projectError || !project) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A projekt nem található.' });
        }
        const { count } = await supabase
          .from('project_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id);
        if (count && count > 0) return { seeded: false };

        const { error } = await supabase.from('project_tasks').insert(
          tasksForWorkType(project.work_type).map((task, index) => ({
            owner_id: user.id,
            project_id: project.id,
            phase_code: task.phase,
            template_item_key: task.key,
            label: task.label,
            position: index,
          })),
        );
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { seeded: true };
      },
    }),

    setPhaseStatus: defineAction({
      accept: 'form',
      input: z.object({
        project_id: z.uuid(),
        phase_code: z.string(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']),
      }),
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const fields: Record<string, unknown> = { status: input.status };
        if (input.status === 'in_progress') fields.started_at = new Date().toISOString();
        if (input.status === 'completed') fields.completed_at = new Date().toISOString();
        const { error } = await supabase
          .from('project_phases')
          .update(fields)
          .eq('project_id', input.project_id)
          .eq('phase_code', input.phase_code);
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { ok: true };
      },
    }),

    setTaskStatus: defineAction({
      accept: 'form',
      input: z.object({
        task_id: z.uuid(),
        project_id: z.uuid(),
        status: z.enum(['todo', 'in_progress', 'done', 'skipped']),
        note: z.string().trim().max(2000).nullish(),
      }),
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const fields: Record<string, unknown> = { status: input.status };
        if (input.note !== undefined && input.note !== null) fields.note = input.note;
        const { data, error } = await supabase
          .from('project_tasks')
          .update(fields)
          .eq('id', input.task_id)
          .eq('project_id', input.project_id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A feladat nem található.' });
        }
        return { ok: true };
      },
    }),

    setTaskVerification: defineAction({
      accept: 'form',
      input: z.object({
        task_id: z.uuid(),
        project_id: z.uuid(),
        verification: z.enum(['not_tested', 'passed', 'failed', 'not_applicable']),
        note: z.string().trim().max(2000).nullish(),
      }),
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const fields: Record<string, unknown> = { verification: input.verification };
        if (input.note !== undefined && input.note !== null) fields.note = input.note;
        const { data, error } = await supabase
          .from('project_tasks')
          .update(fields)
          .eq('id', input.task_id)
          .eq('project_id', input.project_id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A feladat nem található.' });
        }
        return { ok: true };
      },
    }),
  },

  resources: {
    createLink: defineAction({
      accept: 'form',
      input: resourceLinkSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { data, error } = await supabase
          .from('project_resources')
          .insert({
            owner_id: user.id,
            project_id: input.project_id,
            kind: 'link',
            provider: input.provider ?? null,
            label: input.label,
            url: input.url,
            note: input.note ?? null,
          })
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { resourceId: data?.[0]?.id };
      },
    }),

    createAccess: defineAction({
      accept: 'form',
      input: resourceAccessSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { data, error } = await supabase
          .from('project_resources')
          .insert({
            owner_id: user.id,
            project_id: input.project_id,
            kind: 'access',
            provider: input.provider,
            label: input.label,
            url: input.url || null,
            username: input.username ?? null,
            vault_ref: input.vault_ref ?? null,
            note: input.note ?? null,
          })
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { resourceId: data?.[0]?.id };
      },
    }),

    uploadFile: defineAction({
      accept: 'form',
      input: resourceUploadSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const file = input.file;
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'A fájl legfeljebb 10 MB lehet.',
          });
        }
        const safeName = file.name.replace(/[^\w.\-()áéíóöőúüűÁÉÍÓÖŐÚÜŰ ]+/g, '_');
        const objectPath = `${user.id}/${input.project_id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(FILE_BUCKET)
          .upload(objectPath, file, { contentType: file.type || 'application/octet-stream' });
        if (uploadError) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: uploadError.message });
        }
        const { error } = await supabase.from('project_resources').insert({
          owner_id: user.id,
          project_id: input.project_id,
          kind: 'file',
          label: input.label || file.name,
          object_path: objectPath,
        });
        if (error) {
          await supabase.storage.from(FILE_BUCKET).remove([objectPath]);
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { ok: true };
      },
    }),

    remove: defineAction({
      accept: 'form',
      input: resourceDeleteSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { data: resource, error: fetchError } = await supabase
          .from('project_resources')
          .select('id, object_path')
          .eq('id', input.resource_id)
          .eq('project_id', input.project_id)
          .maybeSingle();
        if (fetchError || !resource) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A tétel nem található.' });
        }
        const { error } = await supabase
          .from('project_resources')
          .delete()
          .eq('id', resource.id);
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (resource.object_path) {
          await supabase.storage.from(FILE_BUCKET).remove([resource.object_path]);
        }
        return { ok: true };
      },
    }),
  },

  notes: {
    create: defineAction({
      accept: 'form',
      input: noteSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { error } = await supabase.from('project_notes').insert({
          owner_id: user.id,
          project_id: input.project_id,
          phase_code: input.phase_code || null,
          title: input.title,
          body_md: input.body_md ?? '',
          client_visible: input.client_visible === 'on',
        });
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return { ok: true };
      },
    }),

    update: defineAction({
      accept: 'form',
      input: noteUpdateSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { data, error } = await supabase
          .from('project_notes')
          .update({
            phase_code: input.phase_code || null,
            title: input.title,
            body_md: input.body_md ?? '',
            client_visible: input.client_visible === 'on',
          })
          .eq('id', input.note_id)
          .eq('project_id', input.project_id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A jegyzet nem található.' });
        }
        return { ok: true };
      },
    }),

    remove: defineAction({
      accept: 'form',
      input: noteDeleteSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { data, error } = await supabase
          .from('project_notes')
          .delete()
          .eq('id', input.note_id)
          .eq('project_id', input.project_id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A jegyzet nem található.' });
        }
        return { ok: true };
      },
    }),
  },

  handover: {
    saveClosure: defineAction({
      accept: 'form',
      input: closureSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { data: current } = await supabase
          .from('projects')
          .select('closed_at')
          .eq('id', input.project_id)
          .maybeSingle();
        if (!current) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A projekt nem található.' });
        }
        const fields: Record<string, unknown> = {
          status: input.status,
          closure_notes: input.closure_notes ?? null,
          invoice_ref: input.invoice_ref ?? null,
          feedback_notes: input.feedback_notes ?? null,
          closed_at: resolveClosedAt(current.closed_at, input.status, new Date()),
        };
        const { data, error } = await supabase
          .from('projects')
          .update(fields)
          .eq('id', input.project_id)
          .select('id');
        if (error) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        if (!data || data.length === 0) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A projekt nem található.' });
        }
        return { ok: true };
      },
    }),

    generate: defineAction({
      accept: 'form',
      input: reportGenerateSchema,
      handler: async (input, context) => {
        const { supabase, user } = requireUser(context);
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*, client:clients(id, display_name)')
          .eq('id', input.project_id)
          .maybeSingle();
        if (projectError || !project) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'A projekt nem található.' });
        }
        const [phases, tasks, resources, notes] = await Promise.all([
          supabase.from('project_phases').select('*').eq('project_id', project.id).order('phase_code'),
          supabase.from('project_tasks').select('*').eq('project_id', project.id).order('phase_code').order('position'),
          supabase.from('project_resources').select('*').eq('project_id', project.id).order('created_at'),
          supabase.from('project_notes').select('*').eq('project_id', project.id).order('updated_at', { ascending: false }),
        ]);
        for (const r of [phases, tasks, resources, notes]) {
          if (r.error) {
            throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: r.error.message });
          }
        }
        const workType = project.work_type as import('../lib/types').WorkType;
        const content_md = buildHandoverMarkdown({
          project,
          phases: phases.data ?? [],
          tasks: tasks.data ?? [],
          resources: resources.data ?? [],
          notes: notes.data ?? [],
          verificationKeys: new Set(
            tasksForWorkType(workType).filter((t) => t.needsVerification).map((t) => t.key),
          ),
          audience: input.audience ?? 'client',
          generatedAt: new Date(),
        });
        const { data: report, error: reportError } = await supabase
          .from('project_reports')
          .insert({
            owner_id: user.id,
            project_id: project.id,
            kind: 'handover',
            audience: input.audience ?? 'client',
            content_md,
          })
          .select('id, created_at');
        if (reportError) {
          throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: reportError.message });
        }
        return { reportId: report?.[0]?.id };
      },
    }),
  },
};

