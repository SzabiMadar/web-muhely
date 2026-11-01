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
    const { data: aUser } = await userA.auth.getUser();
    const { data: existingClient } = await userA
      .from('clients')
      .select('id')
      .eq('display_name', 'Fenyo Studio')
      .maybeSingle();
    clientId = existingClient?.id;
    if (!clientId) {
      const { data: created } = await userA
        .from('clients')
        .insert({ owner_id: aUser.user!.id, display_name: 'Fenyo Studio' })
        .select('id')
        .single();
      clientId = created?.id;
    }
    const { data: existingProject } = await userA
      .from('projects')
      .select('id')
      .eq('title', 'Fenyo weboldal')
      .maybeSingle();
    projectId = existingProject?.id;
    if (!projectId) {
      const { data: created } = await userA
        .from('projects')
        .insert({ owner_id: aUser.user!.id, client_id: clientId, title: 'Fenyo weboldal', work_type: 'new_site' })
        .select('id')
        .single();
      projectId = created?.id;
    }
    const { data: phases } = await userA
      .from('project_phases')
      .select('phase_code')
      .eq('project_id', projectId);
    if ((phases ?? []).length === 0) {
      await userA.from('project_phases').insert(
        ['01','02','03','04','05','06','07','08','09','10','11'].map((code) => ({
          owner_id: aUser.user!.id, project_id: projectId, phase_code: code,
        })),
      );
    }
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

  it('B nem látja A jegyzeteit és riportjait', async () => {
    const { data: aUser } = await userA.auth.getUser();
    await userA.from('project_notes').insert({
      owner_id: aUser.user!.id, project_id: projectId, title: 'RLS-teszt jegyzet', body_md: 'x',
    });
    await userA.from('project_reports').insert({
      owner_id: aUser.user!.id, project_id: projectId, kind: 'handover', content_md: '# t',
    });
    const { data: notes } = await userB.from('project_notes').select('id');
    const { data: reports } = await userB.from('project_reports').select('id');
    expect(notes ?? []).toHaveLength(0);
    expect(reports ?? []).toHaveLength(0);
  });

  it('közvetlen Storage-upload nemlétező projekt alá deny', async () => {
    const { data: aUser } = await userA.auth.getUser();
    const path = `${aUser.user!.id}/${crypto.randomUUID()}/probe.txt`;
    const { error } = await userA.storage.from('project-files').upload(path, new Blob(['x'], { type: 'text/plain' }));
    expect(error).not.toBeNull();
  });

  it('közvetlen Storage-upload saját projekt alá OK', async () => {
    const { data: aUser } = await userA.auth.getUser();
    const path = `${aUser.user!.id}/${projectId}/probe-${Date.now()}.txt`;
    const { error } = await userA.storage.from('project-files').upload(path, new Blob(['x'], { type: 'text/plain' }));
    expect(error).toBeNull();
    await userA.storage.from('project-files').remove([path]);
  });

  it('B nem tud feltölteni A projektútvonalára (uid-prefix deny)', async () => {
    const { data: aUser } = await userA.auth.getUser();
    const path = `${aUser.user!.id}/${projectId}/evil-${Date.now()}.txt`;
    const { error } = await userB.storage.from('project-files').upload(path, new Blob(['x'], { type: 'text/plain' }));
    expect(error).not.toBeNull();
  });

  it('B nem tud jegyzetet beszúrni A projektjéhez', async () => {
    const { data: bUser } = await userB.auth.getUser();
    const { error } = await userB.from('project_notes').insert({
      owner_id: bUser.user!.id, project_id: projectId, title: 'Illegális', body_md: '',
    });
    expect(error).not.toBeNull();
  });
});
