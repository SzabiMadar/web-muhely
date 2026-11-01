import { describe, expect, it } from 'vitest';
import { buildHandoverMarkdown, mdToHtml, resolveClosedAt } from '../../src/lib/reporting/handover';
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
    { id: 't2', owner_id: 'u1', project_id: 'p1', phase_code: '02', template_item_key: null, label: 'Nem QA teendő', status: 'todo', verification: 'not_tested', note: null, position: 1, created_at: '', updated_at: '' },
    { id: 't3', owner_id: 'u1', project_id: 'p1', phase_code: '02', template_item_key: 'p09-func', label: 'Hibás QA', status: 'done', verification: 'failed', note: 'Mobil menü rossz', position: 2, created_at: '', updated_at: '' },
    { id: 't4', owner_id: 'u1', project_id: 'p1', phase_code: '02', template_item_key: 'p09-resp', label: 'Ellenőrizetlen QA', status: 'todo', verification: 'not_tested', note: null, position: 3, created_at: '', updated_at: '' },
  ],
  resources: [
    { id: 'r1', owner_id: 'u1', project_id: 'p1', kind: 'link', provider: 'GitHub', label: 'Repo', url: 'https://github.com/x/y', object_path: null, username: null, vault_ref: null, note: null, created_at: '', updated_at: '' },
    { id: 'r2', owner_id: 'u1', project_id: 'p1', kind: 'access', provider: 'Netlify', label: 'Hosting', url: 'https://app.netlify.com', object_path: null, username: 'szabo', vault_ref: '1PW > hosting', note: null, created_at: '', updated_at: '' },
  ],
  notes: [
    { id: 'n1', owner_id: 'u1', project_id: 'p1', phase_code: '01', title: 'Brief jegyzet', body_md: 'Jegyzet törzs', created_at: '', updated_at: '' },
  ],
  verificationKeys: new Set(['p09-func', 'p09-resp']),
  audience: 'client',
  generatedAt: new Date('2026-11-01T12:00:00Z'),
};

describe('buildHandoverMarkdown', () => {
  const md = buildHandoverMarkdown(base);

  it('fejléc és projektadatok', () => {
    expect(md).toContain('# Átadási dokumentum — Teszt weboldal');
    expect(md).toContain('**Ügyfél:** Fenyő Studio');
    expect(md).toContain('SZ-2026-042');
    expect(md).toContain('Scope szöveg');
  });

  it('QA: failed és not_tested külön szekcióban, csak releváns tételek', () => {
    expect(md).toContain('### Sikertelen ellenőrzések');
    expect(md).toContain('**SIKERTELEN** Hibás QA');
    expect(md).toContain('Mobil menü rossz');
    expect(md).toContain('### Ellenőrzésre váró tételek');
    expect(md).toContain('**nem ellenőrzött** Ellenőrizetlen QA');
    // a nem-QA feladat és a passed tétel NEM szerepel
    const qaSection = md.split('## QA-állapot')[1].split('## Erőforrások')[0];
    expect(qaSection).not.toContain('Nem QA teendő');
    expect(qaSection).not.toContain('Kész feladat');
  });

  it('nyitott tételek minden nyitott feladatot mutat', () => {
    expect(md).toContain('[teendő] Nem QA teendő');
    expect(md).toContain('[teendő] Ellenőrizetlen QA');
  });

  it('client riport: nincs vault_ref és username', () => {
    expect(md).toContain('**Hosting** — Netlify');
    expect(md).not.toContain('vault: 1PW');
    expect(md).not.toContain('szabo');
    expect(md).toContain('belső fiókazonosítók');
  });

  it('internal riport: vault_ref és username benne van', () => {
    const internal = buildHandoverMarkdown({ ...base, audience: 'internal' });
    expect(internal).toContain('vault: 1PW > hosting');
    expect(internal).toContain('szabo');
  });

  it('üres projekt: őszinte üres szekciók', () => {
    const empty = buildHandoverMarkdown({
      ...base,
      project: { ...base.project, scope_md: null, closure_notes: null, invoice_ref: null, feedback_notes: null },
      phases: [], tasks: [], resources: [], notes: [],
    });
    expect(empty).toContain('_Nincs nyitott feladat._');
    expect(empty).toContain('_Ebben a projektben nincs ellenőrzési tétel._');
    expect(empty).toContain('_Nincs csatolt erőforrás._');
    expect(empty).toContain('_Nincs rögzített hozzáférés._');
    expect(empty).toContain('_Nincs rögzített jegyzet._');
    expect(empty).not.toContain('## Scope');
  });

  it('QA-tételek mind megfeleltek: őszinte siker-szöveg', () => {
    const allPassed = buildHandoverMarkdown({
      ...base,
      tasks: [
        { ...base.tasks[0], template_item_key: 'p09-func', verification: 'passed' },
      ],
    });
    expect(allPassed).toContain('_Nincs sikertelen tétel._');
    expect(allPassed).toContain('_Minden ellenőrzendő tétel megfelelt vagy nem értelmezhető._');
  });
});

describe('resolveClosedAt', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  const first = '2026-10-01T09:00:00Z';

  it('első lezárás beállítja', () => {
    expect(resolveClosedAt(null, 'delivered', now)).toBe(now.toISOString());
    expect(resolveClosedAt(null, 'archived', now)).toBe(now.toISOString());
    expect(resolveClosedAt(null, 'cancelled', now)).toBe(now.toISOString());
  });

  it('már létező dátumot nem ír felül', () => {
    expect(resolveClosedAt(first, 'delivered', now)).toBe(first);
    expect(resolveClosedAt(first, 'archived', now)).toBe(first);
    expect(resolveClosedAt(first, 'cancelled', now)).toBe(first);
  });

  it('újranyitás törli', () => {
    expect(resolveClosedAt(first, 'active', now)).toBeNull();
    expect(resolveClosedAt(first, 'paused', now)).toBeNull();
    expect(resolveClosedAt(first, 'draft', now)).toBeNull();
  });

  it('újralezárás új dátumot kap', () => {
    const reopened = resolveClosedAt(first, 'active', now);
    expect(reopened).toBeNull();
    const reclose = new Date('2026-11-15T08:00:00Z');
    expect(resolveClosedAt(reopened, 'delivered', reclose)).toBe(reclose.toISOString());
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
