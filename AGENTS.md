# AGENTS.md — Műhely Workspace (aktív, egyszerűsített v2)

## Kötelező termék- és kontextushatár

Ez a **SzabiMadar/web-muhely** repository (új, tiszta kezdőrepo) **egyetlen személy számára készülő webes fejlesztési munkatér**. A cél: ügyfél → projekt → vezetett munka → dosszié → átadás és karbantartási visszakeresés.

**Csak a jelenlegi munkafa `README.md`, `docs/`, `skills/`, `ui-preview/`, `prompts/` állományai a követelményforrások.** Ne keresd a régi brancheket, commitelőzményeket, más ZIP-eket, chatnaplókat vagy archivált terveket a scope kibővítéséhez. Ha régi anyagra lenne szükség, kérj külön jóváhagyást. Az aktuális utasítások felülírnak minden korábbi tervezési ötletet.

## Első olvasás

1. `README.md`
2. `docs/product/PRODUCT_PLAN.md`
3. `docs/product/MVP_SCOPE.md`
4. `docs/delivery/IMPLEMENTATION_PLAN.md`
5. `docs/architecture/TECHNICAL_PLAN.md`
6. `docs/design/DESIGN_SYSTEM.md`
7. UI-munkánál `skills/muhely-ui-taste/SKILL.md`
8. `prompts/W0_START.md`

## Fejlesztési keretek

- **Csak az aktuálisan kiosztott W0/W1/… szeletet implementáld.** Most kizárólag W0 engedélyezett.
- Astro SSR, TypeScript strict, natív CSS, Supabase Auth/PostgreSQL/Storage, Astro Actions és Zod. Könyvtár- vagy stackváltás külön indoklást igényel.
- Az első kiadás kizárólag webapp. Ne építs PWA-t, desktop klienst, offline szinkront, AI-hívást, GitHub API-klienst vagy általános ERP/CRM funkciókat.
- A design önálló követelmény. Használd a megadott design tokeneket, a UI Taste Skillt és a képernyőmintát. Az interakciók ne legyenek csak dekoratívak.
- Egy ügyfélhez több projekt kapcsolódhat, de projektadat két külön projekt között nem keveredhet.
- 11 szakmai fázis = verziókezelt útmutatótartalom és újrahasznosítható UI, **nem 11 külön backendmodul**.
- A feladatok állapotát a felhasználó jelöli. Ellenőrzésnél `not_tested`, `passed`, `failed`, `not_applicable` külön jelentésű.
- Ne tárolj jelszavakat, hozzáférési tokeneket és SSH-kulcsokat. Csak külső jelszókezelőre mutató referenciákat.
- W0-ban a Supabase-t még ne integráld; használj `.env.example`-t, jelöld a kapcsolódást `NOT_CONFIGURED`-ként; ne gyárts hamis hitelesítést vagy ügyféladatot.
- A hitelesítés, jogosultság, projekt-owner ellenőrzés és RLS a későbbi adatkezelő szeletekben kötelező.
- Ne állíts nem futtatott teszteket, képernyőképeket vagy migrációkat sikeresnek.
- Ez a GitHub repository induláskor nyilvános; ne commitolj valós ügyféladatot, titkot vagy környezeti konfigurációt. W0 alatt nincs production deploy.
- A helyi munkakönyvtárat ellenőrizd; ha még nem Git repository, állítsd be a meglévő `https://github.com/SzabiMadar/web-muhely.git` távoli repót. Ne erőltesd felül (`force push`) a történetet, és az első push előtt kérj jóváhagyást.

## Minden feladat lezárásakor

Add meg: mi készült el; módosított fájlok; tényleges parancsok és PASS/FAIL/NOT_TESTED eredmények; desktop/mobil vizuális ellenőrzés; fennmaradó problémák; következő legkisebb fejlesztési szelet. Ne kezdj következő szeletbe új jóváhagyás nélkül.
