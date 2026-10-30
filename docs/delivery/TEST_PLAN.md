# Teszt és minőségbiztosítási terv

## Első teljes kritikus E2E útvonal

1. Bejelentkezés tesztfiókkal.
2. `Ügyfél A` felvétele (név + e-mail), utána szerkesztése.
3. `Projekt 1 / új weboldal` létrehozása hozzá.
4. `Projekt 2 / SEO-t tartalmazó kisebb fejlesztés` ugyanahhoz az ügyfélhez.
5. Projekt 1: aktuális fázis/next action megjelenik, feladat kézi teljesítése megmarad.
6. Projekt 1: QA `not_tested`, majd `failed`, aztán `passed`; a jelentés mindig pontos.
7. GitHub link, staging URL és vault referencia felvétele; nincs jelszó mező.
8. PDF/fájl próbamelléklet feltöltése csak privát bucketbe; megnyitás csak ownerrel.
9. Záró összefoglaló és Markdown-átadás exportja.
10. Projekt 2 adatai nem jelenhetnek meg Projekt 1 reportjában.
11. Projekt archiválás után visszakereshető.
12. Kijelentkezve nincs üzleti adat, API/action sem adja vissza.

## Automatizált minimum

- TypeScript strict typecheck.
- Unit: fázisok, következő feladat algoritmus, status↔verification jelentése, report formatter.
- Integration: ügyfél és projekt összetett FK, owner RLS, task persistence, Storage objektum ownership.
- E2E: egy projekt teljes kritikus útja, mobil navigáció, üres/hibás űrlap, védett route.
- Build: Astro production build a cél hosting adapterrel.

## Nem funkcionális

- Billentyűzet, látható focus, 375/768/1440 viewport, kontraszt, hibaüzenetek.
- Elérhetőség: hálózati hiba nem tünteti el a form inputot.
- Túl hosszú projekt- és ügyfélnevek nem törik a gridet.
- Opcionális vagy hiányzó mezők nem jelennek meg kitalált értékkel.
- Jelszavak, kulcsok, tokenek nem szerepelnek logban, JSON exportban vagy DB-ben.
- Ügyfél- és file adatok csak jogosult felhasználónak jelennek meg.

## PASS/FAIL/NOT_TESTED

Minden teszt eredményhez konkrét parancs és futtatási dátum tartozik. A kézzel nem ellenőrzött UI állapot `NOT_TESTED`, nem `PASS`. A UI látványterv, migráció-vázlat és jövőbeli AI terv nem teljesített implementáció.
