# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utilities defined at end of file, after all call sites
**Severity:** Low
**Lines:** 2141
In a script-in-HTML context, all code is evaluated sequentially. `escapeHtml`, `escapeQuotes`, and `showToast` are defined at line 2141+, but they are called from functions defined much earlier (e.g., `bfCardHTML` at line 1882). This works because the call sites are inside function bodies (not top-level calls) — the functions are defined before any of them are invoked. However, if any utility were called at the top level (e.g., during initialisation), it would fail with "function not defined".
**Action:** Move utility functions to the top of the script section so their position reflects their foundational role, or at minimum add a comment explaining that late definition is safe because all callers are function-scoped.

### `showToast` is the only user-feedback utility; no structured error display
**Severity:** Low
**Lines:** 2150–2155
`showToast(msg, isError)` handles both success and error feedback with a single transient toast. For network errors, validation failures, or multi-step operations, a transient toast may be insufficient. The `isError` boolean enables error styling but provides no way to show persistent errors or actionable messages.
**Action:** For the current app scope this is acceptable. If more complex feedback is needed, consider a persistent notification area or an error modal.

### No shared `formatManaCostShort` equivalent for full mana cost display
**Severity:** Low
**Lines:** 2141–2156
`formatManaCostShort` (line 1642) is defined in the Play State section (not here) despite being a pure formatting utility. The Utilities section lacks it, suggesting the utility grouping is inconsistent.
**Action:** Move `formatManaCostShort` to the Utilities section to consolidate all pure formatting/escaping functions in one place.

## Summary
The utilities section contains the right functions but is architecturally misplaced (at the end of the file) and missing `formatManaCostShort`. The `escapeHtml`/`escapeQuotes` security gaps noted in the security review are the most important architectural concern — they represent foundational functions that the entire file relies on for XSS prevention.
