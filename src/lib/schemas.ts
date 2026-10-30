import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const clientInputSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, 'Az ügyfél neve kötelező.')
    .max(200, 'A név legfeljebb 200 karakter lehet.'),
  company_name: optionalText(200),
  contact_name: optionalText(200),
  email: z
    .union([z.literal(''), z.email('Érvénytelen e-mail cím.')])
    .nullish()
    .transform((value) => (value ? value : null)),
  phone: optionalText(50),
  address_text: optionalText(500),
  notes: optionalText(5000),
});

export const clientUpdateSchema = clientInputSchema.extend({
  id: z.uuid(),
});

export const workTypeSchema = z.enum(['new_site', 'redesign', 'small_change']);
export const projectStatusSchema = z.enum(['draft', 'active', 'paused', 'delivered', 'archived', 'cancelled']);

export const projectCreateSchema = z
  .object({
    client_mode: z.enum(['existing', 'new']),
    client_id: z.string().nullish(),
    new_client_name: z.string().trim().max(200).nullish(),
    title: z
      .string()
      .trim()
      .min(1, 'A projekt neve kötelező.')
      .max(200, 'A projekt neve legfeljebb 200 karakter lehet.'),
    work_type: workTypeSchema,
    scope_md: optionalText(20000),
    requirements_md: optionalText(20000),
    due_date: z
      .union([z.literal(''), z.iso.date('Érvénytelen dátumformátum.')])
      .nullish()
      .transform((value) => (value ? value : null)),
  })
  .superRefine((value, ctx) => {
    if (value.client_mode === 'existing' && !value.client_id) {
      ctx.addIssue({ code: 'custom', path: ['client_id'], message: 'Válassz meglévő ügyfelet.' });
    }
    if (value.client_mode === 'new' && !value.new_client_name) {
      ctx.addIssue({
        code: 'custom',
        path: ['new_client_name'],
        message: 'Add meg az új ügyfél nevét.',
      });
    }
  });

export const projectUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1, 'A projekt neve kötelező.').max(200),
  status: projectStatusSchema,
  scope_md: optionalText(20000),
  requirements_md: optionalText(20000),
  due_date: z
    .union([z.literal(''), z.iso.date('Érvénytelen dátumformátum.')])
    .nullish()
    .transform((value) => (value ? value : null)),
});

export const signInSchema = z.object({
  email: z.email('Érvénytelen e-mail cím.'),
  password: z.string().min(1, 'A jelszó megadása kötelező.'),
  next: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientInputSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

export const resourceLinkSchema = z.object({
  project_id: z.uuid(),
  provider: z.string().trim().max(100).nullish(),
  label: z.string().trim().min(1, 'A címke kötelező.').max(200),
  url: z.url('Érvényes URL-t adj meg (https://…).'),
  note: z.string().trim().max(2000).nullish(),
});

export const resourceAccessSchema = z.object({
  project_id: z.uuid(),
  provider: z.string().trim().min(1, 'A szolgáltató neve kötelező.').max(100),
  label: z.string().trim().min(1, 'A címke kötelező.').max(200),
  url: z.union([z.literal(''), z.url('Érvényes URL-t adj meg.')]).nullish(),
  username: z.string().trim().max(200).nullish(),
  vault_ref: z.string().trim().max(200).nullish(),
  note: z.string().trim().max(2000).nullish(),
});

export const resourceUploadSchema = z.object({
  project_id: z.uuid(),
  label: z.string().trim().max(200).nullish(),
  file: z.instanceof(File).refine(
    (file) => file.size > 0,
    'Válassz ki egy fájlt.',
  ),
});

export const resourceDeleteSchema = z.object({
  project_id: z.uuid(),
  resource_id: z.uuid(),
});
