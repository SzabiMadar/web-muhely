import { describe, expect, it } from 'vitest';
import { clientInputSchema, projectCreateSchema, projectUpdateSchema } from '../../src/lib/schemas';

describe('clientInputSchema', () => {
  it('elfogadja a minimális űrlapot (csak név)', () => {
    const result = clientInputSchema.safeParse({ display_name: 'Fenyő Studio' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_name).toBeNull();
      expect(result.data.email).toBeNull();
    }
  });

  it('visszautasítja az üres nevet', () => {
    const result = clientInputSchema.safeParse({ display_name: '   ' });
    expect(result.success).toBe(false);
  });

  it('visszautasítja az érvénytelen e-mailt', () => {
    const result = clientInputSchema.safeParse({ display_name: 'X', email: 'nem-email' });
    expect(result.success).toBe(false);
  });

  it('üres e-mail mezőt null-ként normalizál', () => {
    const result = clientInputSchema.safeParse({ display_name: 'X', email: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBeNull();
  });
});

describe('projectCreateSchema', () => {
  const base = { title: 'Teszt projekt', work_type: 'new_site' as const };

  it('meglévő ügyfél módban client_id-t vár', () => {
    const missing = projectCreateSchema.safeParse({ ...base, client_mode: 'existing' });
    expect(missing.success).toBe(false);

    const ok = projectCreateSchema.safeParse({
      ...base,
      client_mode: 'existing',
      client_id: '123e4567-e89b-42d3-a456-426614174000',
    });
    expect(ok.success).toBe(true);
  });

  it('új ügyfél módban nevet vár', () => {
    const missing = projectCreateSchema.safeParse({ ...base, client_mode: 'new' });
    expect(missing.success).toBe(false);

    const ok = projectCreateSchema.safeParse({ ...base, client_mode: 'new', new_client_name: 'Új Ügyfél Kft.' });
    expect(ok.success).toBe(true);
  });

  it('visszautasítja az ismeretlen munkatípust', () => {
    const result = projectCreateSchema.safeParse({ ...base, client_mode: 'new', new_client_name: 'X', work_type: 'magic' });
    expect(result.success).toBe(false);
  });

  it('üres határidőt null-ként normalizál', () => {
    const result = projectCreateSchema.safeParse({ ...base, client_mode: 'new', new_client_name: 'X', due_date: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.due_date).toBeNull();
  });
});

describe('projectUpdateSchema', () => {
  it('érvényes státuszt fogad el', () => {
    const result = projectUpdateSchema.safeParse({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'X',
      status: 'paused',
    });
    expect(result.success).toBe(true);
  });

  it('visszautasítja az ismeretlen státuszt', () => {
    const result = projectUpdateSchema.safeParse({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'X',
      status: 'flying',
    });
    expect(result.success).toBe(false);
  });
});
