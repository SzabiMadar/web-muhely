# Műhely Workspace — egyszerűsített webalkalmazás

**Aktív termékirány:** egyfelhasználós, webes, magyar nyelvű, vizuálisan igényes ügyfél- és projektmunkatér. **Jelenlegi állapot:** fejlesztői terv és képernyőminta; az Astro/Supabase alkalmazás még nem készült el.

## Mit építünk?

- Ügyfelek és egy ügyfélhez több projekt.
- Projekt: munka típusa, követelmények, aktuális fázis, következő feladat.
- 11 fázisos szakmai playbook, projekttípushoz rendelt útmutatókkal és kézi állapotjelöléssel.
- Projektdosszié: fájlok, linkek, jegyzetek, Github, staging, hosting, DNS, jelszókezelő-referenciák (secrets nélkül).
- Projektátadás: összefoglaló, számla- és ügyfél-visszajelzési hivatkozások, későbbi karbantartási visszakeresés.
- Letisztult, nyugodt, prémium felület desktopon és mobilon.

## Tech stack

Astro SSR + TypeScript strict + natív CSS; Supabase Auth + PostgreSQL + privát Storage; Zod a szerveroldali beviteli határokon. Egyszerű moduláris monolit. Webapp az első kiadásban. **Nincs desktop/PWA, offline szinkron, AI API, GitHub API, saját jelszótár vagy multi-tenant admin az MVP-ben.**

## Mely dokumentumok irányadók?

1. `AGENTS.md` — fejlesztő agent kötelező szabályai.
2. `docs/product/PRODUCT_PLAN.md` és `docs/product/MVP_SCOPE.md` — termék és minimális funkciók.
3. `docs/delivery/IMPLEMENTATION_PLAN.md` — W0→W4 egymásra épülő szeletek.
4. `docs/architecture/TECHNICAL_PLAN.md`, `DATA_MODEL.md`, `ROUTES_ACTIONS.md` — egyszerű architektúra.
5. `docs/design/DESIGN_SYSTEM.md` és `skills/muhely-ui-taste/SKILL.md` — UI design minősége.
6. `ui-preview/` — **kizárólag látványreferencia**, fiktív adatokkal.
7. `docs/product/PLAYBOOK_AND_AI.md` — szakmai fázisok; AI csak későbbi bővítés.
8. `prompts/W0_START.md` — első fejlesztői feladat.

## Jelenlegi fejlesztési cél

**W0:** Astro SSR app alap + TypeScript strict + design tokenek + AppShell + magyar dashboard korrekt üres állapottal + ellenőrzött parancsok. A Supabase-be való tényleges bejelentkezés és az ügyfél/projekt CRUD **W1**, és csak W0 elfogadása után indul.

## Kontextushatár

Kizárólag a jelen munkafa aktuális fájljai adják a termék követelményeit. Korábbi brancheket, commitokat, csevegéseket, ZIP-eket és külső specifikációkat ne olvass be követelményforrásként. Későbbi Taste Workflow csatlakozás megengedett, de **nem** része W0-nak.

## Fejlesztői indítás

**Elvárás:** Node.js `>=22.23.4` (az Astro 7 engine-feltétele), npm.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check — TypeScript strict, 0 hiba
npm test         # vitest — unit tesztek tests/unit alatt
npm run build    # production build a @astrojs/netlify adapterrel
```

Az alkalmazás SSR módban fut; a build a `.netlify/` könyvtárba generálja a szerverfüggvényt, a statikus assetek a `dist/` alá kerülnek. A Supabase kapcsolathoz szükséges környezeti változók nevei az `.env.example` fájlban vannak.

### Helyi Supabase (W1)

```bash
npx supabase start   # Docker kell hozzá; az első induláskor letölti az image-eket
npx supabase stop
```

Az `npx supabase start` kimenetében kapott `API_URL` és `ANON_KEY` kerüljön a `.env`-be (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`). A migráció a `supabase/migrations/0001_core_schema.sql` — induláskor automatikusan lefut. RLS-teszt futtatása helyben:

```bash
SUPABASE_TEST_URL=http://127.0.0.1:54321 \
SUPABASE_TEST_ANON=<anon kulcs> \
SUPABASE_TEST_SERVICE=<service role kulcs> \
npm test
```

Tesztfelhasználó létrehozása helyben: `POST {API_URL}/auth/v1/signup` `{email, password}` törzzsel (a lokális GoTrue autoconfirmed).
