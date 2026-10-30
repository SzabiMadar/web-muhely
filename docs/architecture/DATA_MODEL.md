# Minimalista adatmodell és invariánsok

**Javaslat:** 7 elsődleges alkalmazástábla; az Auth felhasználók és Storage objektumok a Supabase saját tárolói. Nem kötelező a táblaszámhoz ragaszkodni, ha valódi adatkonzisztencia indokol egy továbbit.

| Tábla | Mit tárol? | Fő mezők |
|---|---|---|
| `clients` | ügyfél törzsadatai | `id`, `owner_id`, `display_name`, `company_name`, `contact_name`, `email`, `phone`, `address_text`, `notes` |
| `projects` | projekt törzsadat, igények, lezárás | `id`, `owner_id`, `client_id`, `title`, `work_type`, `status`, `scope_md`, `requirements_md`, `due_date`, `closure_notes`, `feedback_notes` |
| `project_phases` | projektfázis állapota | `owner_id`, `project_id`, `phase_code`, `status`, `started_at`, `completed_at` |
| `project_tasks` | projekt-checklist és QA | `owner_id`, `project_id`, `phase_code`, `template_item_key`, `label`, `status`, `verification`, `note` |
| `project_resources` | link, fájl, hozzáférési referencia | `owner_id`, `project_id`, `kind`, `provider`, `label`, `url`, `object_path`, `username`, `vault_ref`, `note` |
| `project_notes` | jegyzet és döntés | `owner_id`, `project_id`, `phase_code?`, `title`, `body_md` |
| `project_reports` | egy adott export szöveges lenyomata | `owner_id`, `project_id`, `kind`, `content_md`, `created_at` |

## Relációk

`clients 1—N projects`; `projects 1—N project_phases/project_tasks/project_resources/project_notes/project_reports`. Egy ügyfélhez több projekt tartozhat. A projekt tulajdonosa és a kapcsolt ügyfél tulajdonosa egyezzen: adatbázis-szintű összetett FK javasolt.

## Enum / állapotok

- `work_type`: `new_site | redesign | small_change`. A SEO és más tevékenység a `requirements_md` és opcionális kategóriák része, nem külön workflow-engine.
- `project.status`: `draft | active | paused | delivered | archived | cancelled`.
- `project_phases.status`: `not_started | in_progress | completed | skipped`.
- `project_tasks.status`: `todo | in_progress | done | skipped`.
- `project_tasks.verification`: `not_tested | passed | failed | not_applicable` (külön jelentésű, nem feladatstátusz).
- `project_resources.kind`: `link | file | access`.

## Kötelező szabályok

1. `client_id` csak ugyanahhoz az `owner_id`-hoz tartozó ügyfelet jelölhet.
2. Projekt-specifikus rekord csak ugyanolyan tulajdonosú projekthez kapcsolódhat.
3. `resource.kind = file` esetén a fájlt a privát Storage-bucketben az adatbázishoz kapcsolt objektumútként tároljuk. URL-alapú resource fájl esetén `link` is lehet.
4. `access` csak hozzáférési **metaadatokat** jelent: például `provider=GitHub`, `url`, `username`, `vault_ref`. Nincs `password`, `token`, `secret`, `private_key` mező.
5. A Taste importja nem írhatja felül a már rögzített és jóváhagyott ügyféltényeket.
6. A riportban az ellenőrzés különböző eredményei eredeti értelmükkel maradnak meg.

## Initial schema

A `supabase/migrations/0001_core_schema.sql` fájl **W1-ben készítendő el**. A jelen csomagban még nincs SQL migráció, és ez szándékos: W0 csak az alkalmazásváz. Minden adatbázis- és Storage-jogosultságot az éles projektben tesztelni kell, különösen: másik user ügyfél- vagy projektrekordjának linkelését, Storage private bucket list/read határait és anonim olvasást.
