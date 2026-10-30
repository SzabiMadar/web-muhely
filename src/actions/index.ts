import { ActionError, defineAction } from 'astro:actions';
import {
  clientInputSchema,
  clientUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  signInSchema,
} from '../lib/schemas';
import { PHASES } from '../lib/phases';
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

        return { projectId: project.id };
      },
    }),

    update: defineAction({
      accept: 'form',
      input: projectUpdateSchema,
      handler: async (input, context) => {
        const { supabase } = requireUser(context);
        const { id, ...fields } = input;
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
  },
};
