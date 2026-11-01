import { describe, expect, it } from 'vitest';
import { buildHandoverMarkdown, mdToHtml } from '../../src/lib/reporting/handover';
import type { HandoverInput } from '../../src/lib/reporting/handover';

const base: HandoverInput = {
  project: {
    id: 'p1', owner_id: 'u1', client_id: 'c1',
    title: 'Teszt weboldal', work_type: 'new_site', status: 'delivered',
    scope_md: 'Scope szöveg', requirements_md: null,
    due_date: '2026-12-15', closure_notes: 'Záró szöveg',
    feedback_notes: 'Elégedett', closed_at: '2026-11-01T10:00:00Z',
    invoice_ref: 'SZ-2026-042', created_at: '', updated_at: '',
    client: { display_name: 'Fenyő Studio' },
  },
  phases: [
    { id: '1', owner_id: 'u1', project_id: 'p1', phase_code: '01', status: 'completed', started_at: null, completed_at: null },
    { id: '2', owner_id: 'u1', project_id: 'p1', phase_code: '02', status: 'in_progress', started_at: null, completed_at: null },
  ],
  tasks: [
    { id: 't1', owner_id: 'u1', project_id: 'p1', phase_code: '01', template_item_key: null, label: 'Kész feladat', status: 'done', verification: 'passed', note: null, position: 0, created_at: '', updated_at: '' },
    { id: 't2', owner_id: 'u1', project_id: 'p1', phase_code: '02', template_item_key: null, label: 'Nyitott feladat', status: 'todo', verification: 'not_tested', note: null, position: 1, created_at: '', updated_at: '' },
    { id: 't3', owner_id: 'u1', project_id: 'p1', phase_code: '02', template_item_key: null, label: 'Hibás QA', status: 'done', verification: 'failed', note: 'Mobil menü rossz', position: 2, created_at: '', updated_at: '' },
  ],
  resources: [
    { id: 'r1', owner_id: 'u1', project_id: 'p1', kind: 'link', provider: 'GitHub', label: 'Repo', url: 'https://github.com/x/y', object_path: null, username: null, vault_ref: null, note: null, created_at: '', updated_at: '' },
    { id: 'r2', owner_id: 'u1', project_id: 'p1', kind: 'access', provider: 'Netlify', label: 'Hosting', url: 'https://app.netlify.com', object_path: null, username: 'szabo', vault_ref: '1PW > hosting', note: null, created_at: '', updated_at: '' },
  ],
  notes: [
    { id: 'n1', owner_id: 'u1', project_id: 'p1', phase_code: '01', title: 'Brief jegyzet', body_md: 'Jegyzet törzs', created_at: '', updated_at: '' },
  ],
  generatedAt: new Date('2026-11-01T12:00:00Z'),
};

describe('buildHandoverMarkdown', () => {
  const md = buildHandoverMarkdown(base);

  it('fejléc és projektadatok', () => {
    expect(md).toContain('# Átadási dokumentum — Teszt weboldal');
    expect(md).toContain('**Ügyfél:** Fenyő Studio');
    expect(md).toContain('**Munkatípus:** Új weboldal');
    expect(md).toContain('**Státusz:** Átadott');
    expect(md).toContain('SZ-2026-042');
    expect(md).toContain('Elégedett');
    expect(md).toContain('Scope szöveg');
  });

  it('fázisösszesítő a státuszokkal', () => {
    expect(md).toContain('01. Megkeresés');
    expect(md).toContain('kész (1/1 feladat)');
    expect(md).toContain('folyamatban (1/2 feladat)');
  });

  it('nyitott tételek külön szekcióban', () => {
    expect(md).toContain('## Nyitott tételek');
    expect(md).toContain('[teendő] Nyitott feladat');
  });

  it('QA: failed és not_tested nem sikeresként jelenik meg', () => {
    expect(md).toContain('## QA-állapot');
    expect(md).toContain('**SIKERTELEN** Hibás QA');
    expect(md).toContain('Mobil menü rossz');
    expect(md).toContain('**nem ellenőrzött** Nyitott feladat');
    // a passed tétel NEM szerepel a QA-probléma szekcióban
    expect(md.split('## QA-állapot')[1].split('## ')[1]).not.toContain('Kész feladat');
  });

  it('erőforrások és hozzáférések — vault_ref látszik, secret nincs', () => {
    expect(md).toContain('[Repo](https://github.com/x/y)');
    expect(md).toContain('vault: 1PW > hosting');
    expect(md).not.toContain('password');
  });

  it('jegyzetek és záró megjegyzés', () => {
    expect(md).toContain('### Brief jegyzet (01. fázis)');
    expect(md).toContain('Jegyzet törzs');
    expect(md).toContain('## Záró megjegyzés');
    expect(md).toContain('Záró szöveg');
  });

  it('üres projekt esetén honest üres szekciók', () => {
    const empty = buildHandoverMarkdown({
      ...base,
      project: { ...base.project, scope_md: null, closure_notes: null, invoice_ref: null, feedback_notes: null },
      phases: [], tasks: [], resources: [], notes: [],
    });
    expect(empty).toContain('_Nincs nyitott feladat._');
    expect(empty).toContain('_Minden ellenőrizendő tétel megfelelt vagy nem értelmezhető._');
    expect(empty).toContain('_Nincs csatolt erőforrás._');
    expect(empty).toContain('_Nincs rögzített hozzáférés._');
    expect(empty).toContain('_Nincs rögzített jegyzet._');
    expect(empty).not.toContain('## Scope');
    expect(empty).not.toContain('## Záró megjegyzés');
  });
});

describe('mdToHtml', () => {
  it('címsorok, listák, bold, link, hr', () => {
    const html = mdToHtml('# T\n## S\n- a\n- b\n**x** [L](https://e.hu)\n---\n### H\n1. első\n2. második');
    expect(html).toContain('<h1>T</h1>');
    expect(html).toContain('<h2>S</h2>');
    expect(html).toContain('<ul><li>a</li><li>b</li></ul>');
    expect(html).toContain('<strong>x</strong>');
    expect(html).toContain('<a href="https://e.hu"');
    expect(html).toContain('<hr>');
    expect(html).toContain('<h3>H</h3>');
    expect(html).toContain('<ol><li>első</li><li>második</li></ol>');
  });

  it('HTML-escape a felhasználói tartalomban', () => {
    const html = mdToHtml('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
