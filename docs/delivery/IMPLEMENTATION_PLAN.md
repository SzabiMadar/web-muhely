# Implementációs terv – kis, vertikális szeletek

**Nincsenek garantált határidők**. Minden szeletet csak elfogadott, tesztelt állapotra építünk. A UI-rendszer minden szeletben együtt fejlődik a backenddel.

## W0 — Repo és látványos, működő webapp alap

**Kimenet:** Astro SSR skeleton, TS strict, stabil `check/test/build`, design tokenek, AppShell, login/route protection építési terv, dashboard valódi empty state-je. `.env.example`, dokumentált hosting- és Supabase setup. Nincs adatbázis hamisítása.

**Exit:** app helyben indul; typecheck+build PASS; 1440px/375px screenshot; nincs dummy KPI éles képernyőn; az új repo docs összhangban.

## W1 — Ügyfelek + projektek + belépés

**Kimenet:** valós Supabase Auth, SQL migration, RLS és owner tesztek; client create/list/edit/detail; project create/list/detail, meglévő/új ügyfél kiválasztás; 3 projekt-sablontípus.

**Exit:** két projekt kapcsolható egy ügyfélhez; A és B fiók RLS próbája; belépés nélkül nincs ügyfél- vagy projektadat; UI magyarul kezelhető, mobil is jó.

## W2 — Project overview + 11 fázisú playbook

**Kimenet:** projekt-áttekintés; fázis-sablon tartalom; task seeding projekttípus szerint; menthető task/fázis állapot; külön QA eredmény; "következő feladat" determinisztikus logika.

**Exit:** sablonfrissítés nem törli a korábbi projektnaplót; not_tested/failed nem szerepel completed-ként; két projekt haladása elkülönül.

## W3 — Projekt-dosszié + hozzáférési térkép

**Kimenet:** kategorizált linkek, privát fájlfeltöltés és letöltés, jegyzetek; 10 előre definiált resource preset; hozzáférés metaadatok vault referenciával.

**Exit:** jogosulatlan fájlhozzáférés deny; fájlhoz projekt kapcsolható; nincs secret input/DB mező; hibás URL és túlméretes fájl kezelése.

## W4 — Átadás és karbantartási visszakeresés

**Kimenet:** záró megjegyzések, számla- és visszajelzési hivatkozások, összefoglaló Markdown és nyomtatóbarát HTML; delivered/archived projekt megnyitható.

**Exit:** export projekthű, nyitott/failed/untested részek láthatók; a report és az adatbázis összhangban; regressziós E2E ügyféltől átadásig.

## W5 — Opcionális következő iteráció (nem MVP)

Taste adapter automatizált előtöltéssel, AI brief-elemzés human review-val, PDF motor, PWA, GitHub adatolvasás, haladó search. Minden W5 elem külön termékdöntés után indulhat.

## Kiadási checklist minden PR-re

- A felhasználói eredmény megfogalmazott, nem csak technikai task.
- Kis felületi és backend diff.
- Minden action validált és authz ellenőrzött.
- Tényleges check/test/build és szükség esetén E2E/RLS PASS.
- UI screenshot desktop+mobile és legalább empty/error állapot ellenőrzés.
- Dokumentáció és visszagörgethetőség leírva.
- Nem jelölünk le nem futtatott tesztet PASS-ként.
