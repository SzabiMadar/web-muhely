# W0 — első kódoló agent feladat

Te vagy a Műhely Workspace senior Astro/TypeScript fejlesztője. **Ebben a körben csak W0-t készítsd el.** Kizárólag az aktív munkafában levő `README.md`, `AGENTS.md`, `docs/`, `skills/`, `ui-preview/` tartalom a követelmény. Korábbi commitokból, branchekből, chatből és más ZIP-ekből ne importálj specifikációt vagy kódot.

## Megvalósítandó

1. Ellenőrizd az aktuális munkafát. Ha nincs alkalmazáskód, ezt nevezd meg; ne állítsd, hogy működő Astro/Supabase projekt létezik.
2. Alakíts ki minimális, induló **Astro SSR + TypeScript strict** webappot. Csak szükséges függőségeket válassz. Induljon a fejlesztői szerver, és legyen használható `npm run check`, `npm test`, `npm run build`.
3. Implementáld a `docs/design/DESIGN_SYSTEM.md` és `skills/muhely-ui-taste/SKILL.md` tokenjeit és UI-hierarchiáját. Hozz létre újrahasznosítható `AppShell`, `Sidebar`, `PageHeader`, `EmptyState` komponenseket.
4. Készíts magyar nyelvű, átgondolt, valódi **üres állapotot** megjelenítő dashboardot. A `ui-preview/` inspiráció, nem bemásolandó kész app. Ne mutass hamis ügyfeleket, projektstatisztikát vagy működésnek álcázott akciót.
5. Legyen fókuszállapot, billentyűzetes használhatóság, 375px/1440px reszponzivitás; készíts képernyőképeket, **ha** a böngészőteszt ténylegesen rendelkezésre áll.
6. Készíts `.env.example`-t Supabase konfigurációs kulcsok neveivel, értékek nélkül, és dokumentáld a W1-ben következő kapcsolódást. Ne hozz létre hamis authot vagy ál-adatbázist.
7. Végezd el az ellenőrzést, és pontosan jelöld a PASS / FAIL / NOT_TESTED eredményeket. Ne implementáld W1–W4-et.

## Nem készülhet el ebben a körben

Valódi ügyfél/projekt CRUD, Supabase adatbázis-séma, fájlfeltöltés, 11 fázis teljes tartalma, Taste Workflow integráció, AI API, PDF export, PWA, desktop app, saját jelszókezelő.

## Elfogadás

- Helyben futó Astro webapp, minőségi és reszponzív dashboard-váz.
- A TypeScript ellenőrzés és production build **ténylegesen** sikeres.
- Nincsenek hamis adatok és nem működőnek álcázott funkciók.
- Módosított fájlok és a tesztek valós állapota dokumentált.
- A következő lépés W1, de csak külön kérésre.
