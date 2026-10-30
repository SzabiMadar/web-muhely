import { describe, expect, it, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * RLS-integrációs tesztek helyi Supabase ellen (`supabase start`).
 * Futtatás: SUPABASE_TEST_URL + SUPABASE_TEST_ANON + SUPABASE_TEST_SERVICE env változókkal.
 * Env nélkül a tesztek átugródnak (skip) — nem PASS-ként jelentendők.
 */

const URL = process.env.SUPABASE_TEST_URL;
const ANON = process.env.SUPABASE_TEST_ANON;
const SERVICE = process.env.SUPABASE_TEST_SERVICE;

const ENABLED = Boolean(URL && ANON && SERVICE);
const RUN = ENABLED ? describe : describe.skip;

async function signInUser(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(URL!, ANON!, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

RUN('RLS adatizoláció', () => {
  let userA: SupabaseClient;
  let userB: SupabaseClient;
  let clientId: string;
  let projectId: string;

  beforeAll(async () => {
    userA = await signInUser('teszt.a@muhely.test', 'jelszo123');
    userB = await signInUser('teszt.b@muhely.test', 'jelszo123');
    const { data: client } = await userA
      .from('clients')
      .select('id')
      .eq('display_name', 'Fenyo Studio')
      .maybeSingle();
    clientId = client?.id;
    const { data: project } = await userA
      .from('projects')
      .select('id')
      .eq('title', 'Fenyo weboldal')
      .maybeSingle();
    projectId = project?.id;
  });

  it('anon kliens nem olvas ügyféladatot', async () => {
    const anon = createClient(URL!, ANON!, { auth: { persistSession: false } });
    const { data } = await anon.from('clients').select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('B felhasználó nem látja A ügyfeleit és projektjeit', async () => {
    const { data: clients } = await userB.from('clients').select('id');
    const { data: projects } = await userB.from('projects').select('id');
    expect(clients ?? []).toHaveLength(0);
    expect(projects ?? []).toHaveLength(0);
  });

  it('B felhasználó nem módosíthatja A rekordját', async () => {
    const { data } = await userB
      .from('clients')
      .update({ display_name: 'átírt név' })
      .eq('id', clientId)
      .select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('B felhasználó nem tud projektet rögzíteni A ügyfeléhez (kompozit FK + RLS)', async () => {
    const { data: bUser } = await userB.auth.getUser();
    const { error } = await userB.from('projects').insert({
      owner_id: bUser.user!.id,
      client_id: clientId,
      title: 'Illegális projekt',
      work_type: 'new_site',
    });
    expect(error).not.toBeNull();
  });

  it('B nem tud fázist beszúrni A projektjéhez', async () => {
    const { data: bUser } = await userB.auth.getUser();
    const { error } = await userB.from('project_phases').insert({
      owner_id: bUser.user!.id,
      project_id: projectId,
      phase_code: '01',
    });
    expect(error).not.toBeNull();
  });

  it('projekt létrehozásakor a 11 fázis létezik', async () => {
    const { data } = await userA.from('project_phases').select('phase_code').eq('project_id', projectId);
    expect((data ?? []).map((p) => p.phase_code).sort()).toEqual([
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
    ]);
  });
});
