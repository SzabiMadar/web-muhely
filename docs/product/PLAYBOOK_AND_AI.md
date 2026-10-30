# 11 fázisú Playbook + AI támogatási térkép

A fázisok szakmai tartalmak, nem 11 egyedi szoftvermodul. Egy közös feladatkomponens és egy közös útmutató sablon jeleníti meg őket. Az alábbi elemek **vázlatok**, a teljes 2026 freelance workflow-kutatásból később kell szakmailag validált tartalommal feltölteni.

| Kód | Fázis | Minimális útmutató/teljesítés | AI-később |
|---|---|---|---|
| 01 | Megkeresés és intake | ügyfél igény, cél, kapcsolat, következő találkozó | brief áttekintés, hiányzó kérdések |
| 02 | Scoping és követelmények | in/out-of-scope, funkcionális igények, mérhető siker | követelmény- és konfliktuselemzés |
| 03 | Ajánlat és megállapodás | scope, becslés, külső ajánlat/szerződés URL | ajánlatvázlat, becslési kérdések |
| 04 | Kickoff és hozzáférések | anyagbekérés, felelősök, repo/hosting referenciák | személyre szabott bekérőlista |
| 05 | Kutatás és stratégia | források, versenytársak, tartalom/SEO célok | kutatási szintézis, csak forrásokból |
| 06 | IA, tartalom és UX | sitemap, user-flow, tartalmi leltár, jóváhagyás | IA/UX vázlat és edge case-ek |
| 07 | Vizuális tervezés | Taste brief/prompt, designreferenciák, design jóváhagyás | Taste-kontextus-előkészítő |
| 08 | Fejlesztés | repo, staging, implementációs checklist, technikai notesz | kódreview ellenőrző kérdések |
| 09 | QA és validáció | funkciók, reszponzivitás, SEO, a11y, teljesítmény, hibák | tesztesetek / hibajegy-tervezet |
| 10 | Élesítés | mentés, DNS/TLS, deploy, robots/indexelés, smoke, rollback | környezetfüggő launch checklist |
| 11 | Átadás és lezárás | átadott assetek, számlák referenciái, karbantartás, visszajelzés | ügyfélriport-tervezet |

## Javasolt útmutató-tartalom séma

- `id`, `version`, `title`, `applies_to` (munkatípusok)
- `goal` – mit kell elérni?
- `why` – miért számít?
- `steps[]` – emberileg végrehajtható lépések
- `done_when[]` – elvárt bizonyíték / megfigyelhető eredmény
- `resources[]` – sablonok, linkek, tooling
- `warnings[]` – tipikus hibák
- `ai_action_key?` – opcionális AI-művelet, nem automata futtatás

## AI működési követelmények

1. Az AI sosem szabadon böngészi az összes ügyféladatot; szerveroldal kizárólag a megengedett projektadatokat állítja össze az adott feladathoz.
2. Kimenete státusza `draft_suggestion`; nincs automatikus `passed`, `approved` vagy `done` bejegyzés.
3. A javaslat mellett látható: felhasznált adatok összefoglalója, ismeretlenek, ellenőrzendő feltételezések, dátum és modell.
4. Külső modellnek nem továbbítható jelszó, token, API-kulcs, nem szükséges személyes elérhetőség vagy felesleges ügyfélanyag.
5. Nem verifikált kutatást, mérési eredményt, WCAG megfelelést vagy pénzügyi tényt az AI nem állíthat tényként.
6. Kikapcsolható, és az alkalmazás AI nélkül teljes értékűen használható.

## Taste integrációs minimálhatár

`ProjectContext -> TasteBriefV1` explicit adapter; kitöltendő/hiányzó mezők a UI-ban láthatók. Kezdetben a Taste önálló nézetben fut, felhasználó által indított előtöltéssel és export/importtal. Meglévő `taste-prompt-builder@1` exportot nem írjuk felül és nem értelmezzük félre. A Workspace saját UI "Taste" elnevezésű design-skillje **nem** azonos a felhasználó ügyféloldalakhoz készített Taste Workflow moduljával.
