# Műhely Workspace 2.0 – termék- és fejlesztési terv

**Dokumentum státusza:** baseline-javaslat, emberi elfogadás után implementálandó  
**Dátum:** 2026-10-29  
**Terméktípus:** személyes használatú, webes, több ügyfél- és projekt kezelésére szolgáló vezetett munkakörnyezet

## 1. Vízió és problémamegfogalmazás

A független webfejlesztő munkája ügyfélkommunikációban, fájlokban, jelszókezelőben, tervezőeszközben, GitHubon, hostingnál és ellenőrzőlistákban szóródik szét. A munkafolyamat szakmai lépései projektváltáskor könnyen elvesznek, az átadás és a későbbi karbantartás sok adat újbóli összeszedését igényli.

**Termékígéret:** "Tudd, mit kell most tenned, hol találod hozzá az anyagokat, mit ellenőriztél, és mire lesz szükséged az átadásnál vagy fél év múlva."

A Műhely Workspace nem általános projektmenedzsment-szoftver és nem AI-autopilot, hanem **szakmai playbook + projektdosszié + egyszerű dokumentum-kimenetek**.

## 2. Felhasználó és fő életciklus

Elsődleges felhasználó: egy freelance, full-stack webfejlesztő; egy belépett fiókkal használja a rendszert, több ügyféllel és párhuzamos projekttel. Nem épül csapatjogosultság, ügyfélportál vagy multi-tenant admin.

1. Ügyfél felvitele / meglévő kiválasztása.
2. Projekt felvitele, munkatípus és kezdeti scope beállítása.
3. Projekt-áttekintés: aktuális szakmai szakasz, következő feladat, határidők, kritikus hiányok.
4. A fázishoz rendelt szakmai útmutató és checklist követése, kézi eredményjelöléssel.
5. Linkek, fájlok, technikai kapcsolatok, jóváhagyott anyagok és jegyzetek kapcsolása a projekthez.
6. Minőségellenőrzés és manuális élesítési/átadási feladatok.
7. Ügyfélnek szánt átadási dokumentum, belső záró összefoglaló és karbantartási karton.
8. Lezárt projekt visszakeresése későbbi módosításokhoz és fenntartáshoz.

## 3. Első kiadás: webapp

A webalkalmazás böngészőben, laptopról és desktopról használható, központi adattárral. A platform célja **nem** az offline vagy natív desktop működés. A tartalmi és domainhatárok később lehetővé tehetik a PWA-t, de nincs rá MVP-feladat.

## 4. Információ-architektúra és fő nézetek

**Első szint:** Dashboard, Projektek, Ügyfelek, Beállítások. A "Karbantartás" a projekt státusza / nézete, nem külön termék.

**Projekt 360°:** Áttekintés | Folyamat | Dosszié | Hozzáférések | Átadás.

- Dashboard: aktív projektek, legközelebbi teendők, megoldatlan figyelmeztetések, legutóbb nyitott projektek. Nem vezetői KPI-dashboard.
- Ügyfél adatlap: megjelenített név, cég/jogi név, kapcsolattartó, e-mail, telefon, cím, megjegyzés, projektek.
- Projekt: név, ügyfél, munkatípus, leírás/scope, állapot, határidő, fázis-progress, fontos linkek.
- Folyamat: 11 szakmai fázis sablonalapú útmutatója; nem releváns lépések kihagyhatók. A felhasználó a státusz gazdája.
- Dosszié: csatolt fájl, külső URL, dokumentum, jegyzet, projekt-eredmény; kereshető/kategorizálható.
- Hozzáférések: szolgáltatás, URL, bejelentkezési név, tulajdonos, jelszókezelő-referencia; soha nem tárol jelszót vagy API-kulcsot.
- Átadás: teljesített/nyitott feladatok, projektanyagok, megvalósult scope, számlahivatkozások és ügyfél-visszajelzés jegyzete; Markdown/nyomtatóbarát kimenet.

## 5. Projekttípusok

Az első kiadásban 3 alap sablon: `new_site` (új weboldal), `redesign` (felújítás), `small_change` (új funkció / kisebb fejlesztés). A projekt beállításánál külön címkékkel jelezhető SEO, teljesítmény, akadálymentesség, CMS, karbantartási igény. Ne alakuljon belőlük teljesen külön workflow-motor.

A fázis-sablonokat verziózott Markdown/JSON tartalom biztosítja. A projekt létrehozásakor a checklist feladatrekordjai rögzülnek; későbbi sablonfrissítés **nem módosíthat visszamenőleg** felhasználói döntést.

## 6. Minőség és státusz

- Feladatstátusz: `todo | in_progress | done | skipped`.
- Ellenőrzés eredménye külön: `not_tested | passed | failed | not_applicable`.
- `done` nem egyenlő `passed`-szel; a jelentésben ezt világosan jelölni kell.
- A fázisok nem blokkoló, korábbi sorrendben vezetett lépések. Sikertelen QA esetén kiemelt figyelmeztetés, de nincs tranzakciós gate-motor.
- A rendszer nem tanúsít jogi, SEO vagy akadálymentességi megfelelést.

## 7. AI és Taste

MVP: AI nélkül is teljesen működő app. A UX/Design fázisban a meglévő Taste Prompt Builder **önálló komponensként** használható, explicit projektadat-előtöltéssel csak adapteren keresztül. Az eredeti `taste-prompt-builder@1` formátumot nem szabad észrevétlenül megváltoztatni.

Következő kiadás: brief- és scope-elemző, majd Taste-kontextus-előkészítő és riportvázlat-generátor. Mindegyik **javaslatot** készít; mentés csak áttekintés és jóváhagyás után.

## 8. Vizuális cél

Prémium, "calm productivity" webapp: világos, enyhén meleg vászon, mély zöld-szénszínű navigáció, visszafogott fenyőzöld kiemelés, erős tipográfia és szabályos kártyaritmus. Sok adat kezelhető, de egy nézet egyszerre egy fontos munkakérdést válaszol meg. A részleteket lásd `../design/DESIGN_SYSTEM.md` és a Taste Skill.

## 9. Nem cél az első verzióban

Natív desktop; offline szinkron; GitHub API/OAuth App; AI-agent autonóm módosítás; teljes CRM; ügyfélportál; automatikus számlázás; projektközi jogosultsági rendszer; saját secrets vault; beépített kódszerkesztő; összetett audit trail; minden formátumot támogató riportmotor; real-time kollaboráció.

## 10. Elfogadás / minimum működő érték

1. Egy ügyfélhez két különálló projekt felvehető és később megtalálható.
2. A projekttípus alapján releváns alaplépések jelennek meg, áttekinthető következő feladattal.
3. Egy GitHub repo, hosting URL, fájl és jelszókezelő-hivatkozás kapcsolható a projekthez.
4. Manuális feladatállapot és ellenőrzési eredmény mentés után megmarad.
5. A projekt összefoglalója valós adatokból készül; `not_tested` nem látszik teljesítésnek.
6. Lezárt projekt adatai később szerkesztés nélkül is biztonságosan visszakereshetők.
7. A felület desktopon és mobilon használható, billentyűzettel navigálható, magyarul érthető.

## 11. Siker mérésének módja

Valós vagy anonimizált tesztprojekten mérjük: következő teendő megtalálásának ideje, projektfájl/link visszakereshetősége, átadási dokumentumhoz szükséges kézi újragépelés, tévesen késznek jelölt QA esetek, napi használhatóság. Ne a funkciók számát maximalizáljuk.
