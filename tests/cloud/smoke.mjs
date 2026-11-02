// Cloud Auth/RLS/Storage smoke — T1–T6 (fiktív userek, marker-alapú takarítással).
// Futáshoz szükséges env: CLOUD_URL, CLOUD_ANON,
//   TEST_USER_A_EMAIL, TEST_USER_A_PASS, TEST_USER_B_EMAIL, TEST_USER_B_PASS
// Exit code: 0 = minden PASS; 1 = hiba/fail (CI-kompatibilis).
import { createClient } from '@supabase/supabase-js';

const URL = process.env.CLOUD_URL;
const ANON = process.env.CLOUD_ANON;
const EMAIL_A = process.env.TEST_USER_A_EMAIL;
const PASS_A = process.env.TEST_USER_A_PASS;
const EMAIL_B = process.env.TEST_USER_B_EMAIL;
const PASS_B = process.env.TEST_USER_B_PASS;
for (const [k, v] of Object.entries({ CLOUD_URL: URL, CLOUD_ANON: ANON, TEST_USER_A_EMAIL: EMAIL_A, TEST_USER_A_PASS: PASS_A, TEST_USER_B_EMAIL: EMAIL_B, TEST_USER_B_PASS: PASS_B })) {
  if (!v) { console.error(`Hiányzó env: ${k}`); process.exit(1); }
}

const RUN_ID = `Smoke_${Date.now()}`;
const created = { clientId: null, projectId: null, objectPaths: [] };
const results = [];
const t = (id, name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ` — ${detail}` : ''}`);
};

const a = createClient(URL, ANON, { auth: { persistSession: false } });
const b = createClient(URL, ANON, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

async function cleanup(client) {
  // Kizárólag a futás által létrehozott elemek törlése — pontos ID-k/útvonalak.
  let clean = true;
  if (created.objectPaths.length) {
    const { error } = await client.storage.from('project-files').remove(created.objectPaths);
    if (error) clean = false;
  }
  if (created.projectId) {
    const { error } = await client.from('projects').delete().eq('id', created.projectId);
    if (error) clean = false;
  }
  if (created.clientId) {
    const { error } = await client.from('clients').delete().eq('id', created.clientId);
    if (error) clean = false;
  }
  return clean;
}

try {
  const la = await a.auth.signInWithPassword({ email: EMAIL_A, password: PASS_A });
  t('T0a', 'A login', !la.error, la.error?.message);
  const lb = await b.auth.signInWithPassword({ email: EMAIL_B, password: PASS_B });
  t('T0b', 'B login', !lb.error, lb.error?.message);
  const uidA = (await a.auth.getUser()).data.user.id;
  const uidB = (await b.auth.getUser()).data.user.id;

  const { data: client, error: cErr } = await a.from('clients').insert({ owner_id: uidA, display_name: `${RUN_ID} Kft` }).select('id').single();
  const { data: proj, error: pErr } = await a.from('projects').insert({ owner_id: uidA, client_id: client?.id, title: `${RUN_ID} projekt`, work_type: 'new_site' }).select('id').single();
  const { error: phErr } = await a.from('project_phases').insert(
    ['01','02','03','04','05','06','07','08','09','10','11'].map((c) => ({ owner_id: uidA, project_id: proj?.id, phase_code: c })));
  created.clientId = client?.id;
  created.projectId = proj?.id;
  t('T1', 'A: ügyfél+projekt+11 fázis', !cErr && !pErr && !phErr, (cErr || pErr || phErr)?.message);

  const { data: bc } = await b.from('clients').select('id');
  const { data: bp } = await b.from('projects').select('id');
  t('T2', 'B: A adatai nem látszanak', (bc ?? []).length === 0 && (bp ?? []).length === 0);

  const { data: an } = await anon.from('clients').select('id');
  t('T3a', 'anon: clients → []', (an ?? []).length === 0);
  const { error: fErr } = await b.from('project_notes').insert({ owner_id: uidB, project_id: proj.id, title: 'x', body_md: '' });
  t('T3b', 'B jegyzet A projektéhez → deny', !!fErr, fErr?.code);
  const { data: upd } = await b.from('clients').update({ display_name: 'hack' }).eq('id', client.id).select('id');
  t('T3c', 'B update A rekordja → 0 sor', (upd ?? []).length === 0);

  const blob = (s) => new Blob([s], { type: 'text/plain' });
  const okPath = `${uidA}/${proj.id}/probe.txt`;
  created.objectPaths.push(okPath);
  const { error: upOk } = await a.storage.from('project-files').upload(okPath, blob('cloud-probe'));
  t('T4a', 'A upload saját projekt alá', !upOk, upOk?.message);
  const { data: signed, error: sErr } = await a.storage.from('project-files').createSignedUrl(okPath, 60);
  const sResp = signed?.signedUrl ? await fetch(signed.signedUrl) : null;
  t('T4b', 'A signed URL → 200', !sErr && sResp?.status === 200, `HTTP ${sResp?.status}`);
  const { error: upBad } = await a.storage.from('project-files').upload(`${uidA}/${crypto.randomUUID()}/x.txt`, blob('x'));
  t('T4c', 'A upload nemlétező projektid → deny', !!upBad, upBad?.message);
  const { error: upB } = await b.storage.from('project-files').upload(`${uidA}/${proj.id}/evil.txt`, blob('x'));
  t('T4d', 'B upload A útvonalára → deny', !!upB, upB?.message);
  const { data: blist } = await b.storage.from('project-files').list(uidA);
  t('T4e', 'B lista A mappájában → []', (blist ?? []).length === 0);
  const { error: bSign } = await b.storage.from('project-files').createSignedUrl(okPath, 60);
  t('T4f', 'B signed URL A fájlhoz → deny', !!bSign, bSign?.message);

  const { error: htmlErr } = await a.storage.from('project-files').upload(`${uidA}/${proj.id}/x.html`, new Blob(['<html>'], { type: 'text/html' }));
  t('T5a', 'bucket: text/html → deny', !!htmlErr, htmlErr?.message);
  const big = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'text/plain' });
  const { error: sizeErr } = await a.storage.from('project-files').upload(`${uidA}/${proj.id}/big.txt`, big);
  t('T5b', 'bucket: >10 MB → deny', !!sizeErr, sizeErr?.message);

  const { error: rErr } = await a.from('project_reports').insert({ owner_id: uidA, project_id: proj.id, kind: 'handover', audience: 'client', content_md: '# Cloud teszt' });
  const { data: bReports } = await b.from('project_reports').select('id');
  const { data: bNotes } = await b.from('project_notes').select('id');
  t('T6', 'A riport OK; B reports+notes → []', !rErr && (bReports ?? []).length === 0 && (bNotes ?? []).length === 0, rErr?.message);
} catch (err) {
  console.error('FATAL', err?.message ?? err);
  results.push(false);
} finally {
  try {
    const uidA = (await a.auth.getUser()).data?.user?.id;
    if (uidA && !(await cleanup(a))) results.push(false);
  } catch {
    results.push(false);
  }
}

const passed = results.filter(Boolean).length;
console.log(`\n=== ${passed}/${results.length} PASS ===`);
process.exit(results.every(Boolean) ? 0 : 1);
