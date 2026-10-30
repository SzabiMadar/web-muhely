---
name: muhely-ui-taste
description: Designs and implements the Műhely Workspace UI with a calm, premium, Hungarian-language productivity aesthetic. Use for dashboard, client, project, playbook, resources, access-map and handover screens in Astro + TypeScript + CSS.
---

# Műhely UI Taste Skill (v1)

## Purpose

Make the Workspace aesthetically coherent, accessible and immediately actionable. **This is the Műhely application's own UI taste skill**, not the earlier customer-site Taste Workflow / Prompt Builder. Do not conflate the two.

## Read first

1. `../../docs/design/DESIGN_SYSTEM.md`
2. `../../docs/product/PRODUCT_PLAN.md`
3. `../../docs/product/MVP_SCOPE.md`
4. `references/SCREEN_BLUEPRINTS.md`
5. `references/COMPONENT_CONTRACTS.md`
6. `references/VISUAL_REVIEW.md`
7. `../../ui-preview/index.html` (visual reference, not production source)

If a relative link is not valid in an agent's execution context, resolve it from the repository root. If these files are missing, report that and do not invent missing requirements.

## Design sequence: do not skip

1. **Understand task:** route, user intention, primary action, available real data, edge cases, authorization boundary.
2. **Sketch information hierarchy:** page title, current context, one prominent primary action, supporting data, secondary navigation.
3. **Choose component pattern:** reuse AppShell, Card, FormField, StatusPill, TaskRow, ResourceCard; do not duplicate styles in every page.
4. **Apply tokens:** canvas `#F6F7F4`, sidebar `#172B24`, ink `#1A2822`, accent `#377D64`, border `#E1E8E1`, radius 16px. No arbitrary theme drift.
5. **Implement semantic UI:** Astro-first, minimal TypeScript interactivity; use native labels, buttons, forms, headings, links.
6. **Model states:** loaded, empty, loading, error, validation error, permission denied; actions must be real and cannot merely look interactive.
7. **Inspect:** desktop 1440px and mobile 375px browser screenshots. Check alignment, hierarchy, density, long Hungarian strings, empty/failure states.
8. **Report:** what changed, screenshots, responsive/a11y issues, run checks and list NOT_TESTED honestly.

## Style signature

- Calm editorial SaaS; slightly warm white background, deep forestry sidebar.
- Typography carries hierarchy; avoid excessive iconography and decorative gradients.
- Active navigation uses subtle tonal contrast with clear text. Kicker labels sparingly.
- Cards have balanced 20–24px padding, 16px radius, quiet borders, barely-there shadows.
- Content should feel "technical craftsman's desk", not a corporate analytics cockpit.
- Use a narrow accent palette; status meaning is explicit (text + icon + color).
- Default to clean white cards; avoid heavy filled success/warning panels.
- Every blank state proposes a useful action: "Első ügyfél hozzáadása" / "Új projekt létrehozása".

## Quality standards

- No fabricated client names or metrics in production flows. Demo fixtures only when visibly labeled.
- No password/token fields, credential values, or secrets in rendered demo content or logs.
- No unbounded list of tiny controls; prioritize progressive disclosure.
- No hard-coded spacing bypassing tokens without an explained design reason.
- No designer-only functionality that blocks keyboard access.
- No overconfident "completed" badges based on AI-generated text or unchecked tasks.
- No final "finished" claim without build/check and screenshot verification.

## The most important screen

**Project overview**: project and client identity, current phase, next action, critical warnings, shortcuts to dossier/access/handover. The user should understand "what now?" within a few seconds. This screen sets the reusable tone for all others.

## Output contract for agent

Every UI task ends with: routes/components changed; reusable tokens/components introduced; screenshot paths and viewports; keyboard/contrast checks performed; actual commands and PASS/FAIL/NOT_TESTED; remaining gaps. Do not fabricate screenshot tests.
