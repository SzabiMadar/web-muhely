# Screen blueprints / UX specifications

## 01. Global dashboard `/dashboard`

**Question answered:** Which project needs attention today?

Desktop anatomy: 248px sidebar; header row with page title and "Új projekt" CTA; 3 lightweight stats; 2-column section with active project list (wide) + "Mai fókusz" (narrow); recent dossier resources below. Empty dashboard: welcome guidance with "Első ügyfél" and "Új projekt" actions.

Content states: new/empty, active projects, no pending tasks, paused projects, network error. Avoid chart-only communication. Every metric derived from actual records.

## 02. Clients `/clients` and `/clients/:id`

Client list: name, optional company/contact, number of projects, last touched project; search by display name/company. Create/edit form with grouped name+company/contact+address. Client detail has contact data + projects, not finance CRM tabs.

UX: `+ Új ügyfél` primary action, compact validation, no mandatory telephone/address.

## 03. Project creation `/projects/new`

Step 1 choose existing client or create quick client; step 2 project name, three work types, short scope; step 3 optional due date, requirements text. Single-page form preferred until data complexity justifies a wizard. Save creates project and 11 phase progress records plus template-specific tasks.

## 04. Project overview `/projects/:id`

Header title + client + status. At-a-glance progress block. A large "Következő lépés" card with exact task. Compact phase timeline (11 phases grouped into 5 visual chapters). Secondary cards: recent materials, environment/links, open QA findings, latest notes. No more than one primary CTA.

## 05. Guided workflow `/projects/:id/workflow`

Left/upper phase navigation with completion state; center focused task list; right collapsible contextual guide (why/how/templates). Each task row: label, status, note, optional verification (`not_tested`, `passed`, `failed`, `not_applicable`); only QA-like tasks need verification. For `failed`, show explicit issue text. The Taste entry point appears inside phase 07.

## 06. Dossier `/projects/:id/resources`

Filters: All / Links / Files / Notes; upload or external link. Rows/cards: type, label, phase, source/domain, added time. Keep file actions discoverable and safe. Untrusted external URLs must be validated/sanitized in display and on input.

## 07. Access map `/projects/:id/access`

Preset form (GitHub, Supabase, Hosting, Domain/DNS, Figma, Analytics, Search Console, CMS, E-mail, Other) with URL, username, owner, status, vault reference and note. **Never** add password or token input. Reveal only metadata not secrets.

## 08. Handover `/projects/:id/handover`

Top: delivered facts, open items and risks. Editable closure summary + external invoice refs + client feedback note. Generate Markdown export; print-friendly HTML preview. Never label untested/failed items as accepted.
