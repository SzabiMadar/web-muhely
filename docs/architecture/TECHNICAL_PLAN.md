# Technikai terv – célarchitektúra

## Döntés

**Egyetlen Astro SSR webapp**, TypeScript `strict`, natív CSS (design tokenek), Supabase Auth + PostgreSQL + privát Storage, Astro Actions, Zod a bemenetekhez. Monorepo, ORM, kliensoldali állapotkezelő és háttér-queue csak bizonyított szükség esetén.

```
Böngésző (Astro oldalak, kevés progresszív TS interakció)
  | HTTPS / session
Astro SSR (oldalvédelem, validáció, projekt-owner ellenőrzés)
  | adat / fájlműveletek
Supabase Auth + PostgreSQL (RLS) + Storage (privát)
  \\ opcionális, később: AI adapter (külön hozzájárulással)
```

## Kötelező implementációs korlátok

- Egyetlen felhasználó, de **auth és RLS kötelező**. A hozzáférést ne frontenden védjük.
- Az RLS-hez azonosítható `owner_id` tartozik minden projektre/ügyfélre vonatkozó sorban; `auth.uid()` alapján védett. FK-val is akadályozzuk meg a másik tulajdonos ügyfelének projekthez társítását.
- Server-side Supabase kulcsok, session és Storage-letöltés kizárólag megfelelő rétegben. A service role kulcs soha nem kerül kliensre, és nem használható általános felhasználói queryhez.
- Nem tárolunk jelszavakat, tokeneket, privát SSH-kulcsokat; csak jelszókezelő-azonosítót/hivatkozást.
- `Zod`-validáció a form adatokra és a `project_type`, `resource.kind`, fáziskódok stb. értékeire.
- Fájlok csak privát bucketbe; engedélyezett MIME-típusok, méretkorlát, projekt-owner ellenőrzés. Privát letöltés időkorlátos signed URL-lel.
- Átadási riport csak a lekérdezett projektből épülhet; nem DOM-scraping.
- Nem tárolunk többféle helyen ellentmondó projektállapotot.
- A demo/preview adatok kötelezően fiktívek.

## Fájl/mappa javaslat

```
src/
  layouts/AppLayout.astro
  pages/login.astro
  pages/dashboard.astro
  pages/clients/index.astro
  pages/clients/[id].astro
  pages/projects/index.astro
  pages/projects/new.astro
  pages/projects/[id]/index.astro
  pages/projects/[id]/workflow.astro
  pages/projects/[id]/resources.astro
  pages/projects/[id]/access.astro
  pages/projects/[id]/handover.astro
  actions/index.ts
  components/{navigation,projects,clients,workflow,resources,ui}/
  lib/server/{auth,db,project-access,reporting,storage}/
  lib/shared/{types,schemas,formatters}/
  content/playbook/{01-intake,...,11-handover}.md
  styles/{tokens,global,components}.css
supabase/migrations/
supabase/tests/
tests/{unit,integration,e2e}/
```

A mappaterv útmutató, nem 1:1 kötelező implementáció. Először vertical slice, később refaktor.

## Adattulajdon, izoláció és időpontok

- Minden sor UUID azonosítóval; `owner_id` a bejelentkezett felhasználó ID-ja.
- Projekt → ügyfél kapcsolat: FK. Projektadat → projekt kapcsolat: FK.
- Időpontok UTC-ben, felület magyar lokalizációval és Europe/Budapest időzónával.
- Pénz: kezdetben számla-/dokumentumreferencia, **nem** pénzügyi főkönyv.
- Adatmegőrzés: archiválás külön a törléstől. Törlés előtt projektenkénti külső erőforrás- és Storage-függőségeket kezelni kell.

## Playbook

A szakmai tudás fájlokban, verziókezelt Content Collection/Markdown-ként tárolódik, nem egy admin CMS-ben. Projekt létrehozásakor a verziózott sablon alapján készülnek a per-projekt feladatok. A felhasználó által beírt státusz és megjegyzés soha nem kerül felülírásra sablonfrissítéstől.

## Telepítés

Első körben egy menedzselt, SSR-t támogató hosting és külön Supabase projekt. Az adapter kiválasztása az adott host célkörnyezetéhez igazodik; ezt kódolás előtt dokumentáltan rögzíteni kell. Állítsunk be staging és production env-et, még ha nincs is valós ügyféladat a stagingben.

## MVP backendhatár

- SSR oldalak védelme: middleware/session + a szerveroldali Action minden kérésnél saját auth ellenőrzés.
- Actionök tulajdonosellenőrzéssel olvassák/módosítják a kiválasztott projektet, az RLS második védelmi réteg.
- Nem készül általános CRUD generátor vagy GraphQL gateway.
- Nem használunk `service_role` kulccsal megvalósított, RLS-t megkerülő mindenes adatelérést.

## Fejlesztői minőség

`npm run check`, `npm test`, `npm run build`, Playwright smoke; fázisos feladat esetén adatizolációs integrációs teszt. A logban ne jelenjen meg teljes brief, személyes kontakt vagy titok.

## Hivatalos műszaki referenciák

- Astro SSR: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro Actions: https://docs.astro.build/en/guides/actions/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage security: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Auth SSR: https://supabase.com/docs/guides/auth/server-side

A dokumentum készítésének napján aktuális API-kat a kódoló agent a tényleges verzióval ellenőrizze. Fictív csomagverzió ne szerepeljen a kódban.
