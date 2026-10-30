import type { WorkType } from '../types';

export interface PhaseGuide {
  code: string;
  version: number;
  title: string;
  appliesTo: WorkType[];
  goal: string;
  why: string;
  steps: string[];
  doneWhen: string[];
  warnings: string[];
}

export interface TaskTemplateItem {
  key: string;
  phase: string;
  label: string;
  appliesTo: WorkType[];
  needsVerification?: boolean;
}

const ALL: WorkType[] = ['new_site', 'redesign', 'small_change'];
const BUILD: WorkType[] = ['new_site', 'redesign'];

export const PHASE_GUIDES: readonly PhaseGuide[] = [
  {
    code: '01', version: 1, title: 'Megkeresés és intake', appliesTo: ALL,
    goal: 'Megérteni, mit akar az ügyfél, és rögzíteni az alapadatokat.',
    why: 'A későbbi scope-viták 90%-a innen ered: ha az igény nincs leírva, nem lesz mire hivatkozni.',
    steps: [
      'Beszélgetés vagy kitöltött brief bekérése az ügyféltől.',
      'Cél és sikerkritérium rögzítése egy-két mondatban.',
      'Kapcsolattartó és döntéshozó azonosítása.',
      'Következő találkozó vagy határidőpont egyeztetése.',
    ],
    doneWhen: ['Az ügyfél igénye le van írva a projekt scope-jában.', 'A kapcsolattartó adatai rögzítve az ügyféllapon.'],
    warnings: ['Ne kezdj ajánlatot adni scope nélkül.', 'A „majd kiderül” mezők később visszaütnének.'],
  },
  {
    code: '02', version: 1, title: 'Scoping és követelmények', appliesTo: ALL,
    goal: 'Határozott in/out-of-scope lista és mérhető siker.',
    why: 'A scope a szerződés és a becslés alapja — ami nincs benne, azt az ügyfél is máshogy értelmezheti.',
    steps: [
      'Funkcionális igények listázása (mit csináljon a rendszer).',
      'Explicit out-of-scope pontok rögzítése.',
      'Technológiai vagy tartalmi speciális igények (SEO, a11y, CMS, karbantartás) megjelölése.',
      'Mérhető sikerfogalom egyeztetése az ügyféllel.',
    ],
    doneWhen: ['Írott, az ügyfél által látott scope létezik.', 'A speciális igények a projekt requirements mezőjében vannak.'],
    warnings: ['A szóbeli megegyezés nem scope.', 'Ne tedd a „minden megoldható” ígéretet.'],
  },
  {
    code: '03', version: 1, title: 'Ajánlat és megállapodás', appliesTo: ALL,
    goal: 'Írásos ajánlat/szerződés a scope alapján.',
    why: 'Ajánlat nélkül nincs védett határidő és ár — a dossziéban a hivatkozását is érdemes tartani.',
    steps: [
      'Becslés a scope alapján (munka + tartalék).',
      'Ajánlat vagy megállapodás elkészítése és kiküldése.',
      'Elfogadás vagy módosítás rögzítése jegyzetként.',
      'Az ajánlat/szerződés URL-jének csatolása a dossziéba (W3).',
    ],
    doneWhen: ['Az ügyfél elfogadta az ajánlatot írásban.', 'Az ajánlathivatkozás elérhető a projektben.'],
    warnings: ['Ne dolgozz elfogadás előtt fizetendő tételen.', 'A becslés ne legyen álomhatáridő.'],
  },
  {
    code: '04', version: 1, title: 'Kickoff és hozzáférések', appliesTo: ALL,
    goal: 'Minden szükséges anyag és hozzáférés kéznél legyen a munka előtt.',
    why: 'A projektek leggyakoribb akadálya a hiányzó belépés/logo/szöveg — ezt előre kell összegyűjteni.',
    steps: [
      'Anyagbekérő lista küldése (logó, szöveg, képek, domain, hosting).',
      'Repo, staging és hosting hivatkozások rögzítése a hozzáférési térképen (W3).',
      'Felelősök és elérési csatornák egyeztetése.',
      'Jelszókezelő-hivatkozások felvétele — jelszó soha nem ide kerül.',
    ],
    doneWhen: ['A kritikus hozzáférések működnek.', 'A hiányzó anyagok listája látszik.'],
    warnings: ['Jelszót, tokent, API-kulcsot soha ne kérj és ne tárolj itt.', 'A „majd küldi” anyag legyen követett tétel.'],
  },
  {
    code: '05', version: 1, title: 'Kutatás és stratégia', appliesTo: BUILD,
    goal: 'Tartalmi és versenytársi háttér, ami alapján tervezni lehet.',
    why: 'Kutatás nélkül a design és az IA csak vélemény — forrásokkal támasztható alá.',
    steps: [
      'Versenytársak és referenciaoldalak áttekintése, jegyzetekkel.',
      'Tartalmi leltár készítése a meglévő anyagból.',
      'SEO- és célközönség-hipotézisek rögzítése.',
      'A lényeges megállapítások rövid összefoglalója.',
    ],
    doneWhen: ['A kutatási jegyzetek a projekthez kapcsolódnak.', 'Van leírható irány a tervezéshez.'],
    warnings: ['Ne váljon a kutatás végtelen procrastinációvá.', 'Csak ténylegesen látott forrásokra hivatkozz.'],
  },
  {
    code: '06', version: 1, title: 'IA, tartalom és UX', appliesTo: BUILD,
    goal: 'Oldaltérkép és tartalmi struktúra, amihez az ügyfél hozzájárul.',
    why: 'Az IA hibáit fejlesztés közben korrigálni a legdrágább — itt olcsó a változtatás.',
    steps: [
      'Sitemap felvázolása a fő oldalakra.',
      'Kulcs user-flow-k és oldaltípusok leírása.',
      'Tartalmi leltár összerendezése az IA-hoz.',
      'Ügyfél-jóváhagyás rögzítése a struktúráról.',
    ],
    doneWhen: ['Az oldaltérkép jóváhagyva.', 'Minden oldalhoz tartozik tartalmi forrás.'],
    warnings: ['Ne kezdd el a vizuális tervezést jóváhagyatlan IA-val.', 'A hiányzó tartalom ne derüljön ki a végén.'],
  },
  {
    code: '07', version: 1, title: 'Vizuális tervezés', appliesTo: BUILD,
    goal: 'Jóváhagyott vizuális irány és design-alapok.',
    why: 'A design-jóváhagyás védi meg mindkét felet a végtelen iterációtól.',
    steps: [
      'Designirány és referenciák összeállítása (a Taste belépési pont itt használható később).',
      'Fő komponensek és képernyők megtervezése.',
      'Ügyfél-visszajelzés begyűjtése és döntés.',
      'Jóváhagyás és designhivatkozások rögzítése.',
    ],
    doneWhen: ['A vizuális irány jóváhagyva az ügyfél által.', 'A designhivatkozás a dossziéban van.'],
    warnings: ['A „tetszik/nem tetszik” helyett konkrét kérdésre kérj visszajelzést.', 'Ne kezdj fejleszteni el nem fogadott designból.'],
  },
  {
    code: '08', version: 1, title: 'Fejlesztés', appliesTo: ALL,
    goal: 'Működő implementáció a jóváhagyott scope és design alapján.',
    why: 'A legtöbb projektrisko itt realizálódik — a checklist segít nem elfelejteni a peremeseteket.',
    steps: [
      'Repo és staging környezet összekapcsolása a hozzáférési térképpel.',
      'Fő funkciók implementálása a scope szerint.',
      'Technikai notesz a nem-triviális döntésekről.',
      'Rendszeres staging-ellenőrzés az ügyféllel vagy magaddal.',
    ],
    doneWhen: ['A scope tételei működnek stagingen.', 'A technikai döntések dokumentálva.'],
    warnings: ['Ne vigyél át titkot a repóba.', 'A scope-növekedés menjen az out-of-scope listára.'],
  },
  {
    code: '09', version: 1, title: 'QA és validáció', appliesTo: ALL,
    goal: 'Mérhetően ellenőrzött minőség az élesítés előtt.',
    why: 'A „szerintem működik” nem ellenőrzés — a `failed` és a `not_tested` itt külön jelentésű.',
    steps: [
      'Funkciók végigkattintása a scope-lista alapján.',
      'Reszponzivitás ellenőrzése 375 és 1440 nézeten.',
      'Technikai SEO, a11y és teljesítmény alapellenőrzés.',
      'Minden hibát vagy `failed`-et jegyezz meg — ne takard el.',
    ],
    doneWhen: ['A QA-tételeknek `passed`/`failed`/`not_applicable` eredménye van.', 'A `failed` tételek ismertek és eldöntötték, blokkolóak-e.'],
    warnings: ['A `done` nem jelent `passed`-et — ez külön állapot.', 'Ne nyomj `passed`-et mérés nélkül.'],
  },
  {
    code: '10', version: 1, title: 'Élesítés', appliesTo: ALL,
    goal: 'Biztonságos, visszafordítható élesítés dokumentált lépésekkel.',
    why: 'A deploy előtti mentés és a smoke-lista menti meg a napod, ha baj van.',
    steps: [
      'Mentés/biztonsági másolat az élesítés előtt.',
      'DNS/TLS és deploy beállítások ellenőrzése.',
      'Indexelés, robots és alap SEO-beállítások átnézése.',
      'Smoke-teszt az éles oldalon + visszagörgetési terv.',
    ],
    doneWhen: ['Az éles oldal működik és ellenőrizve lett.', 'A rollback-út ismert.'],
    warnings: ['Élesítés péntek délután csak indokolt esetben.', 'A DNS-propagáció nem azonnali — jelezd az ügyfélnek.'],
  },
  {
    code: '11', version: 1, title: 'Átadás és lezárás', appliesTo: ALL,
    goal: 'Rendezett átadás, amihez a későbbi karbantartás is visszatalál.',
    why: 'Fél év múlva te vagy az ügyfél itt keresi a belépéseket és az állapotot — most spórolsz meg órákat.',
    steps: [
      'Átadott assetek és hivatkozások összegyűjtése a dossziéból.',
      'Záró összefoglaló és számlahivatkozások rögzítése (W4).',
      'Ügyfél-visszajelzés jegyzeteként feljegyzése.',
      'Karbantartási egyezmény vagy lezárási státusz beállítása.',
    ],
    doneWhen: ['Az átadási dokumentum elkészült.', 'A projekt `delivered` vagy `archived` státuszú.'],
    warnings: ['Az átadás nem számlakibocsátás — csak hivatkozást rögzítesz.', 'Ne zárd le úgy, hogy a vault-hivatkozások hiányoznak.'],
  },
] as const;

export const TASK_TEMPLATES: readonly TaskTemplateItem[] = [
  { key: 'p01-intake',   phase: '01', label: 'Ügyfél-igény és cél leírása a projektbe', appliesTo: ALL },
  { key: 'p01-contact',  phase: '01', label: 'Kapcsolattartó és döntéshozó rögzítése', appliesTo: ALL },
  { key: 'p01-meeting',  phase: '01', label: 'Következő találkozó egyeztetése', appliesTo: ALL },
  { key: 'p02-scope',    phase: '02', label: 'In-scope / out-of-scope lista', appliesTo: ALL },
  { key: 'p02-reqs',     phase: '02', label: 'Speciális igények (SEO/a11y/CMS/karbantartás)', appliesTo: ALL },
  { key: 'p02-success',  phase: '02', label: 'Mérhető sikerkritérium egyeztetése', appliesTo: ALL },
  { key: 'p03-estimate', phase: '03', label: 'Becslés a scope alapján', appliesTo: ALL },
  { key: 'p03-offer',    phase: '03', label: 'Ajánlat/szerződés kiküldése és elfogadása', appliesTo: ALL },
  { key: 'p04-assets',   phase: '04', label: 'Anyagbekérő lista kiküldése és nyomon követése', appliesTo: ALL },
  { key: 'p04-access',   phase: '04', label: 'Repo, staging, hosting hozzáférések rögzítése', appliesTo: ALL },
  { key: 'p04-roles',    phase: '04', label: 'Felelősök és elérési csatornák egyeztetése', appliesTo: ALL },
  { key: 'p05-compete',  phase: '05', label: 'Versenytársak és referenciák jegyzetelése', appliesTo: BUILD },
  { key: 'p05-content',  phase: '05', label: 'Tartalmi leltár a meglévő anyagból', appliesTo: BUILD },
  { key: 'p05-seo',      phase: '05', label: 'SEO- és célközönség-hipotézisek', appliesTo: ['new_site'] },
  { key: 'p06-sitemap',  phase: '06', label: 'Oldaltérkép (sitemap) felvázolása', appliesTo: BUILD },
  { key: 'p06-flow',     phase: '06', label: 'Kulcs user-flow-k és oldaltípusok', appliesTo: BUILD },
  { key: 'p06-approval', phase: '06', label: 'Ügyfél-jóváhagyás az IA-ról', appliesTo: BUILD },
  { key: 'p07-direction',phase: '07', label: 'Designirány és referenciák', appliesTo: BUILD },
  { key: 'p07-screens',  phase: '07', label: 'Fő komponensek és képernyők tervezése', appliesTo: BUILD },
  { key: 'p07-approval', phase: '07', label: 'Design-jóváhagyás az ügyféllel', appliesTo: BUILD },
  { key: 'p08-env',      phase: '08', label: 'Repo + staging összekapcsolása', appliesTo: ALL },
  { key: 'p08-impl',     phase: '08', label: 'Scope-funkciók implementálása', appliesTo: ALL },
  { key: 'p08-notes',    phase: '08', label: 'Technikai notesz a döntésekről', appliesTo: ALL },
  { key: 'p09-func',     phase: '09', label: 'Funkciók végigkattintása', appliesTo: ALL, needsVerification: true },
  { key: 'p09-resp',     phase: '09', label: 'Reszponzivitás (375 / 1440 px)', appliesTo: ALL, needsVerification: true },
  { key: 'p09-seo-a11y', phase: '09', label: 'SEO / a11y / teljesítmény alapellenőrzés', appliesTo: BUILD, needsVerification: true },
  { key: 'p09-bugs',     phase: '09', label: 'Hibák és `failed` tételek dokumentálása', appliesTo: ALL, needsVerification: true },
  { key: 'p10-backup',   phase: '10', label: 'Mentés/biztonsági másolat élesítés előtt', appliesTo: ALL, needsVerification: true },
  { key: 'p10-dns',      phase: '10', label: 'DNS/TLS és deploy beállítások', appliesTo: ALL, needsVerification: true },
  { key: 'p10-index',    phase: '10', label: 'Indexelés, robots, SEO-alapok', appliesTo: BUILD, needsVerification: true },
  { key: 'p10-smoke',    phase: '10', label: 'Éles smoke-teszt + visszagörgetési terv', appliesTo: ALL, needsVerification: true },
  { key: 'p11-assets',   phase: '11', label: 'Átadott assetek és hivatkozások összegyűjtése', appliesTo: ALL },
  { key: 'p11-handover', phase: '11', label: 'Záró összefoglaló + számlahivatkozás', appliesTo: ALL },
  { key: 'p11-feedback', phase: '11', label: 'Ügyfél-visszajelzés jegyzete', appliesTo: ALL },
  { key: 'p11-maint',    phase: '11', label: 'Karbantartási egyezmény / lezárási státusz', appliesTo: ALL },
] as const;

export function tasksForWorkType(workType: WorkType): readonly TaskTemplateItem[] {
  return TASK_TEMPLATES.filter((task) => task.appliesTo.includes(workType));
}

export function guideForPhase(code: string, workType: WorkType): PhaseGuide | null {
  return PHASE_GUIDES.find((guide) => guide.code === code && guide.appliesTo.includes(workType)) ?? null;
}
