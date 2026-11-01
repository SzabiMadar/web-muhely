import { PHASES } from '../phases';
import type {
  Project,
  ProjectNote,
  ProjectPhase,
  ProjectResource,
  ProjectTask,
  WorkType,
} from '../types';

export interface HandoverInput {
  project: Project & { client?: { display_name: string } | null };
  phases: ProjectPhase[];
  tasks: ProjectTask[];
  resources: ProjectResource[];
  notes: ProjectNote[];
  verificationKeys: Set<string>;
  audience: 'client' | 'internal';
  generatedAt: Date;
}

const WORK_TYPE_LABEL: Record<WorkType, string> = {
  new_site: 'Új weboldal',
  redesign: 'Redesign',
  small_change: 'Kisebb fejlesztés',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Tervezés alatt',
  active: 'Aktív',
  paused: 'Szünetel',
  delivered: 'Átadott',
  archived: 'Archivált',
  cancelled: 'Lemondott',
};

const PHASE_STATUS_LABEL: Record<string, string> = {
  not_started: 'nem kezdődött',
  in_progress: 'folyamatban',
  completed: 'kész',
  skipped: 'kihagyva',
};

const TASK_STATUS_LABEL: Record<string, string> = {
  todo: 'teendő',
  in_progress: 'folyamatban',
  done: 'kész',
  skipped: 'kihagyva',
};

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('hu-HU') : '—';

export function buildHandoverMarkdown(input: HandoverInput): string {
  const { project, phases, tasks, resources, notes, verificationKeys, generatedAt } = input;
  const L: string[] = [];
  const phaseTitle = (code: string) => PHASES.find((p) => p.code === code)?.title ?? code;

  L.push(`# Átadási dokumentum — ${project.title}`);
  L.push('');
  L.push(`Generálva: ${generatedAt.toLocaleString('hu-HU')}`);
  L.push('');
  L.push('## Projektadatok');
  L.push('');
  L.push(`- **Projekt:** ${project.title}`);
  L.push(`- **Ügyfél:** ${project.client?.display_name ?? '—'}`);
  L.push(`- **Munkatípus:** ${WORK_TYPE_LABEL[project.work_type] ?? project.work_type}`);
  L.push(`- **Státusz:** ${STATUS_LABEL[project.status] ?? project.status}`);
  L.push(`- **Határidő:** ${fmtDate(project.due_date)}`);
  L.push(`- **Lezárva:** ${fmtDate(project.closed_at)}`);
  if (project.invoice_ref) L.push(`- **Számlahivatkozás:** ${project.invoice_ref}`);
  if (project.feedback_notes) L.push(`- **Ügyfél-visszajelzés:** ${project.feedback_notes}`);
  L.push('');
  if (input.audience === 'internal' && project.scope_md) {
    L.push('## Scope');
    L.push('');
    L.push(project.scope_md);
    L.push('');
  }
  if (input.audience === 'internal' && project.requirements_md) {
    L.push('## Követelmények');
    L.push('');
    L.push(project.requirements_md);
    L.push('');
  }

  L.push('## Fázisösszesítő');
  L.push('');
  for (const phase of phases) {
    const phaseTasks = tasks.filter((t) => t.phase_code === phase.phase_code);
    const done = phaseTasks.filter((t) => t.status === 'done' || t.status === 'skipped').length;
    const title = phaseTitle(phase.phase_code);
    L.push(`- **${phase.phase_code}. ${title}** — ${PHASE_STATUS_LABEL[phase.status] ?? phase.status} (${done}/${phaseTasks.length} feladat)`);
  }
  L.push('');

  const openTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  L.push('## Nyitott tételek');
  L.push('');
  if (openTasks.length === 0) {
    L.push('_Nincs nyitott feladat._');
  } else {
    for (const t of openTasks) {
      L.push(`- [${TASK_STATUS_LABEL[t.status]}] ${t.label} (${t.phase_code}. ${phaseTitle(t.phase_code)})`);
    }
  }
  L.push('');

  const qaRelevant = tasks.filter(
    (t) => (t.template_item_key && verificationKeys.has(t.template_item_key))
      || t.verification === 'failed' || t.verification === 'passed' || t.verification === 'not_applicable',
  );
  const failedTasks = qaRelevant.filter((t) => t.verification === 'failed');
  const untestedTasks = qaRelevant.filter((t) => t.verification === 'not_tested');
  L.push('## QA-állapot');
  L.push('');
  if (qaRelevant.length === 0) {
    L.push('_Ebben a projektben nincs ellenőrzési tétel._');
  } else {
    L.push('### Sikertelen ellenőrzések');
    L.push('');
    if (failedTasks.length === 0) {
      L.push('_Nincs sikertelen tétel._');
    } else {
      for (const t of failedTasks) {
        const note = t.note ? ` — ${t.note}` : '';
        L.push(`- **SIKERTELEN** ${t.label} (feladat: ${TASK_STATUS_LABEL[t.status]})${note}`);
      }
    }
    L.push('');
    L.push('### Ellenőrzésre váró tételek');
    L.push('');
    if (untestedTasks.length === 0) {
      L.push('_Minden ellenőrzendő tétel megfelelt vagy nem értelmezhető._');
    } else {
      for (const t of untestedTasks) {
        L.push(`- **nem ellenőrzött** ${t.label} (feladat: ${TASK_STATUS_LABEL[t.status]})`);
      }
    }
  }
  L.push('');

  const links = resources.filter((r) => r.kind === 'link');
  const files = resources.filter((r) => r.kind === 'file');
  const accesses = resources.filter((r) => r.kind === 'access');
  L.push('## Erőforrások és hivatkozások');
  L.push('');
  if (links.length === 0 && files.length === 0) {
    L.push('_Nincs csatolt erőforrás._');
  } else {
    for (const r of links) {
      L.push(`- ${r.provider ? `${r.provider} — ` : ''}[${r.label}](${r.url ?? ''})`);
    }
    for (const r of files) {
      L.push(`- Fájl: ${r.label} (privát tárolóban)`);
    }
  }
  L.push('');
  if (input.audience === 'internal') {
    L.push('## Hozzáférési térkép (metaadatok)');
    L.push('');
    if (accesses.length === 0) {
      L.push('_Nincs rögzített hozzáférés._');
    } else {
      for (const r of accesses) {
        const parts = [r.provider, r.username].filter(Boolean).join(' — ');
        L.push(`- **${r.label}** — ${parts}${r.vault_ref ? ` · vault: ${r.vault_ref}` : ''}${r.url ? ` · ${r.url}` : ''}`);
      }
    }
    L.push('');
  }

  const visibleNotes = input.audience === 'client' ? notes.filter((n) => n.client_visible) : notes;
  L.push('## Jegyzetek');
  L.push('');
  if (visibleNotes.length === 0) {
    L.push(input.audience === 'client' ? '_Nincs ügyféllel megosztott jegyzet._' : '_Nincs rögzített jegyzet._');
  } else {
    for (const n of visibleNotes) {
      L.push(`### ${n.title}${n.phase_code ? ` (${n.phase_code}. fázis)` : ''}`);
      L.push('');
      L.push(n.body_md || '_Üres jegyzet._');
      L.push('');
    }
  }

  if (project.closure_notes) {
    L.push('## Záró megjegyzés');
    L.push('');
    L.push(project.closure_notes);
    L.push('');
  }

  if (input.audience === 'client') {
    L.push('---');
    L.push('_A belső jegyzetek, a scope/részletes követelmények és a hozzáférési térkép a műhely-dossziéban maradnak._');
    L.push('');
  }
  L.push('---');
  L.push('_Ez a dokumentum a Műhely Workspace adatbázisából generálódott. Csak ténylegesen rögzített adatokat tartalmaz._');
  return L.join('\n');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inline = (s: string) =>
  escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\b_([^_]+)_\b/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

export function mdToHtml(md: string): string {
  const out: string[] = [];
  let list: string[] = [];
  let ordered = false;
  const flush = () => {
    if (list.length) {
      out.push(`<${ordered ? 'ol' : 'ul'}>${list.map((li) => `<li>${li}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      list = [];
    }
  };
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (t.startsWith('- ')) { list.push(inline(t.slice(2))); ordered = false; continue; }
    if (/^\d+\.\s/.test(t)) { if (!ordered) flush(); ordered = true; list.push(inline(t.replace(/^\d+\.\s/, ''))); continue; }
    flush();
    if (!t) continue;
    if (t === '---') out.push('<hr>');
    else if (t.startsWith('### ')) out.push(`<h3>${inline(t.slice(4))}</h3>`);
    else if (t.startsWith('## ')) out.push(`<h2>${inline(t.slice(3))}</h2>`);
    else if (t.startsWith('# ')) out.push(`<h1>${inline(t.slice(2))}</h1>`);
    else out.push(`<p>${inline(t)}</p>`);
  }
  flush();
  return out.join('\n');
}

const CLOSED_STATUSES = new Set(['delivered', 'archived', 'cancelled']);

export function resolveClosedAt(current: string | null, newStatus: string, now: Date): string | null {
  if (!CLOSED_STATUSES.has(newStatus)) return null;
  return current ?? now.toISOString();
}
