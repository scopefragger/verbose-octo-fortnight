# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `id` parameter in `showCtxMenu` is stored without validation
**Severity:** Low
**Lines:** 1997–1999
`showCtxMenu(e, id)` accepts an `id` argument and stores it directly in the global `ctxTarget`. No type check or validation is performed. The `id` is generated in `renderBFCard()` from `bfc.id` which originates from app state (not direct user input), so the risk is low, but a malformed id could cause the downstream action functions (`tapCard`, `sendToGrave`, etc.) to behave unexpectedly.
**Action:** Add a runtime guard: `if (typeof id !== 'string' && typeof id !== 'number') return;` at the top of `showCtxMenu`.

### `action` string in `ctxAction` is not validated before use
**Severity:** Low
**Lines:** 2008–2017
`ctxAction(action)` is called from inline `onclick` attributes in the static HTML (lines 994–998) with hard-coded string literals, so injection from user data is not a concern here. However, if future dynamic menu items ever call `ctxAction` with a value derived from external data, the lack of validation would be a risk.
**Action:** Document (via a comment) that the only valid action strings are `'tap'`, `'hand'`, `'top'`, `'grave'`, and `'exile'`, or add an allowlist check.

## Summary
No significant XSS or injection risks exist in this segment because no user-supplied or API-supplied data is rendered into HTML and the action strings are hard-coded literals in the static DOM. The findings are precautionary.
