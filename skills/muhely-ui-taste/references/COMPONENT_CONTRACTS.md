# UI components and behavior contracts

- `AppShell`: sidebar landmark, main region, mobile navigation; visible active route; skip link.
- `PageHeader`: title, short context, max. one primary CTA; breadcrumbs where useful.
- `ProjectCard`: title, client, work type, status, next task, due date; whole card click must not trap embedded buttons.
- `StageProgress`: 11 semantic phases grouped into 5 chapters; screen-reader accessible progress description; not all phase steps are strictly sequential blockers.
- `TaskRow`: independently controllable status, optional verification, note; optimistic updates only with rollback and error announcement.
- `ResourceCard`: kind (file/link/access), label, provider, added date, safe open/download action; secrets never included.
- `StatusPill`: semantic text + optional icon, always legible without color.
- `EmptyState`: reason, next action; use actual state not generic illustrations.
- `FormField`: label, hint, field, error, proper autocomplete when relevant.
- `Toast`: aria-live, not used as only confirmation of persistent or irreversible actions.
- `ConfirmDialog`: dangerous actions only; keyboard focus managed.
- `AIProposal` (later): clearly labeled draft, input scope visible, explicit Accept/Discard; never auto-update source of truth.

All elements: keyboard flow, focus ring, high enough contrast, 375px no document horizontal overflow, meaningful hit target, no inert buttons.
