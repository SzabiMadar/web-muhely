# Műhely Workspace — egyszerűsített webalkalmazás

**Aktív termékirány:** egyfelhasználós, webes, magyar nyelvű, vizuálisan igényes ügyfél- és projektmunkatér. **Jelenlegi állapot:** a W0–W4 MVP-szeletek elkészültek — a teljes ügyfél→projekt→munka→dosszié→átadás útvonal működik helyi Supabase-szel.

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

## MVP-státusz (W0–W4)

| Szelet | Tartalom | Állapot |
|---|---|---|
| W0 | Astro SSR app shell, design tokenek, AppShell, valódi üres állapotok | ✅ |
| W1 | Supabase Auth, szerveroldali route protection, kompozit-FK + RLS, ügyfél/projekt CRUD | ✅ |
| W2 | 11 fázisú playbook, munkatípus-sablonok, feladat/QA-állapotok (done ≠ passed) | ✅ |
| W3 | Dosszié (linkek, presetek, privát fájlok, signed URL), hozzáférési térkép (vault_ref, secrets nélkül) | ✅ |
| W4 | Lezárás (státusz + záradék + számla/visszajelzés-hivatkozás), Markdown-riport `project_reports`-snapshotbal, nyomtatható HTML, projektjegyzetek, delivered/archived visszakeresés | ✅ |

**Ami még nincs:** Supabase Cloud-projekt és Netlify deploy (eddig csak lokális Docker), W5 funkciók (AI, PDF-motor, GitHub-integráció, PWA).

**Production előtti javítások:**
- W3 fájlfeltöltésnél nincs MIME-whitelist (csak méretlimit + útvonal-ellenőrzés) — exe/script feltöltés kezdőnaposan tiltható kellene.
- `delivered`/`archived` projekt továbbra is szerkeszthető (nincs read-only lock az MVP-ben).

## Fejlesztési keretek

- Csak az aktuálisan kiosztott szeletet implementáld — most **W4 kész**, W5 nem kezdődött.
- Minden fázis verziózott sablontartalom (`src/lib/playbook/templates.ts`), nem 11 backendmodul.
- A feladatok állapotát a felhasználó jelöli; `not_tested`/`failed`/`not_applicable` külön jelentésű a `passed`-től.
- Semmi jelszó, token, SSH-kulcs nem kerül az adatbázisba — csak jelszókezelő-referencia.

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

Az `npx supabase start` kimenetében kapott `API_URL` és `ANON_KEY` kerüljön a `.env`-be (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`). A migrációk (`supabase/migrations/0001`–`0004`) induláskor automatikusan lefutnak. RLS-teszt futtatása helyben:

```bash
SUPABASE_TEST_URL=http://127.0.0.1:54321 \
SUPABASE_TEST_ANON=<anon kulcs> \
SUPABASE_TEST_SERVICE=<service role kulcs> \
npm test
```

Tesztfelhasználó létrehozása helyben: `POST {API_URL}/auth/v1/signup` `{email, password}` törzzsel (a lokális GoTrue autoconfirmed).
