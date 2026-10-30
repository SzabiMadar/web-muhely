export interface Phase {
  readonly code: string;
  readonly title: string;
  readonly summary: string;
  readonly chapter: string;
}

export interface PhaseChapter {
  readonly code: string;
  readonly title: string;
  readonly phaseCodes: readonly string[];
}

export const PHASES: readonly Phase[] = [
  { code: '01', title: 'Megkeresés és intake', summary: 'Ügyfél igény, cél, kapcsolat, következő találkozó.', chapter: 'prep' },
  { code: '02', title: 'Scoping és követelmények', summary: 'In/out-of-scope, funkcionális igények, mérhető siker.', chapter: 'prep' },
  { code: '03', title: 'Ajánlat és megállapodás', summary: 'Scope, becslés, külső ajánlat vagy szerződés.', chapter: 'prep' },
  { code: '04', title: 'Kickoff és hozzáférések', summary: 'Anyagbekérés, felelősök, repo és hosting referenciák.', chapter: 'start' },
  { code: '05', title: 'Kutatás és stratégia', summary: 'Források, versenytársak, tartalmi és SEO célok.', chapter: 'start' },
  { code: '06', title: 'IA, tartalom és UX', summary: 'Sitemap, user-flow, tartalmi leltár, jóváhagyás.', chapter: 'design' },
  { code: '07', title: 'Vizuális tervezés', summary: 'Designirány, designrendszer, jóváhagyás.', chapter: 'design' },
  { code: '08', title: 'Fejlesztés', summary: 'Repo, staging, implementációs checklist, technikai notesz.', chapter: 'build' },
  { code: '09', title: 'QA és validáció', summary: 'Funkciók, reszponzivitás, SEO, a11y, teljesítmény, hibák.', chapter: 'build' },
  { code: '10', title: 'Élesítés', summary: 'Mentés, DNS/TLS, deploy, indexelés, smoke, rollback.', chapter: 'launch' },
  { code: '11', title: 'Átadás és lezárás', summary: 'Átadott assetek, számlareferenciák, karbantartás, visszajelzés.', chapter: 'launch' },
] as const;

export const PHASE_CHAPTERS: readonly PhaseChapter[] = [
  { code: 'prep', title: 'Felkészülés', phaseCodes: ['01', '02', '03'] },
  { code: 'start', title: 'Elindítás', phaseCodes: ['04', '05'] },
  { code: 'design', title: 'Tervezés', phaseCodes: ['06', '07'] },
  { code: 'build', title: 'Megvalósítás', phaseCodes: ['08', '09'] },
  { code: 'launch', title: 'Élesítés és átadás', phaseCodes: ['10', '11'] },
] as const;

export function getPhasesByChapter(chapter: PhaseChapter): readonly Phase[] {
  return PHASES.filter((phase) => phase.chapter === chapter.code);
}
