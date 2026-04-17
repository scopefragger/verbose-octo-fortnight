# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxAction()` action string comes from hard-coded HTML `onclick` attributes — safe
**Severity:** Low
**Lines:** 994–998, 2008
The `action` parameter to `ctxAction()` is always a hard-coded string literal from the static HTML (`'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'`). There is no path where user input or external API data reaches `action`. The dispatch is safe.
**Action:** No action needed — positive finding.

### `ctxTarget` is a numeric float ID set via `showCtxMenu(e, id)` — safe for current ID type
**Severity:** Low
**Lines:** 1999
`ctxTarget` is set to the `id` argument passed to `showCtxMenu`. As established in the Play State review, IDs are `Date.now() + Math.random()` floats. Since the ID never reaches `innerHTML` in this section (it is passed to action functions that use it only for `Array.find` lookups), there is no XSS surface here.
**Action:** No action needed. Document that `id` must remain a non-string type to keep this safe.

### Global `document.addEventListener('click', ...)` registered at module parse time
**Severity:** Low
**Lines:** 2019–2021
The global click listener is attached unconditionally at script parse time (not inside `DOMContentLoaded`). While this works in a single-page HTML file loaded linearly, it is a subtle anti-pattern: if the script ever runs in an environment where the DOM is not yet ready, `getElementById` inside the listener body could return null on first invocation.
**Action:** Move global event listener registration inside a `DOMContentLoaded` handler, or guard with a null check inside the listener.

## Summary
No active XSS or injection risks exist in this section. The action dispatch uses only hard-coded strings and the ID type is safe for its current usage. The main concern is that the function is effectively dead (no call site for `showCtxMenu`) which means the security properties cannot be exercised either way.
