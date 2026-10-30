# Navigáció, műveletek és UI-állapotok

## Kötelező útvonalak

| Route | Feladat |
|---|---|
| `/login` | belépés / visszatérés |
| `/dashboard` | összesített projektek és prioritások |
| `/clients` | ügyféllista + felvitel |
| `/clients/:id` | ügyféladatlap és kapcsolt projektek |
| `/projects` | projektlista, keresés és szűrés |
| `/projects/new` | új projekt, ügyfél kiválasztás/felvitel |
| `/projects/:id` | projekt-áttekintés |
| `/projects/:id/workflow` | 11 fázis / feladatok |
| `/projects/:id/resources` | anyagok, fájlok, linkek |
| `/projects/:id/access` | hozzáférési térkép, vault hivatkozások |
| `/projects/:id/handover` | átadás és záró jegyzetek |

## Akciók / szerveroldali use case-ek

- `createClient`, `updateClient`, `listClients`, `getClient`.
- `createProject`, `updateProject`, `listProjects`, `getProjectOverview`.
- `setPhaseStatus`, `setTaskStatus`, `setTaskVerification`.
- `addResource`, `updateResource`, `deleteResource`, `uploadProjectFile`, `requestProjectFileDownload`.
- `createNote`, `updateNote`.
- `generateHandoverMarkdown`, `saveClosureNotes`.

A névlista nem követel minden metódushoz saját HTTP endpointot. Astro Actions lehet az egyszerű szerveroldali végrehajtási réteg. Minden író művelet validált inputból, bejelentkezett sessionből és projekt-owner ellenőrzésből indul.

## Állapotok, amelyeket minden fontos oldalon meg kell tervezni

`loading`, `empty`, `filled`, `saving`, `success`, `validation_error`, `network_error`, `permission_denied`. Nincs csak "happy path" képernyő. Kézi mentés után olvasható visszajelzés és hibánál megmaradó felhasználói input szükséges.

## Tájékozódás

Sidebar: Áttekintés, Projektek, Ügyfelek, Beállítások. Projekten belül topbar: projekt név + ügyfél + státusz; tabok: Áttekintés, Folyamat, Dosszié, Hozzáférések, Átadás. A Taste belépési pont a 07-es fázis útmutató mellé kerül, nem globális főmenüpont az MVP-ben.
