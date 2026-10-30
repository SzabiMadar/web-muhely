# Pre-merge UI review checklist

## Layout

- [ ] Sidebar, header, cards align on a consistent rhythm.
- [ ] Page title and main action are visible at first glance.
- [ ] Main content is not cramped at 1280–1440px.
- [ ] At 375px nothing overlaps or causes horizontal page scroll.
- [ ] Hungarian labels (including long project names) wrap/truncate gracefully.

## Semantics and interaction

- [ ] Primary CTA has a real action.
- [ ] Empty, loading, error and success states exist.
- [ ] Form inputs have accessible labels and described errors.
- [ ] Keyboard focus is visible, tab order logical, dialogs closable.
- [ ] Status is not communicated by color alone.

## Content and trust

- [ ] Unknown fields are presented as unknown, not filled with fictional AI guesses.
- [ ] NOT_TESTED is never displayed as PASSED or DONE.
- [ ] No password/token/secret field, console log or preview content.
- [ ] Destructive action requires confirmation.

## Evidence

- [ ] Desktop screenshot saved (1440x900 or comparable).
- [ ] Mobile screenshot saved (375x812 or comparable).
- [ ] Visual before/after described in PR.
- [ ] `check/test/build` output recorded as PASS/FAIL/NOT_TESTED.
