# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `action` parameter in `ctxAction` comes from HTML `onclick` attributes
**Severity:** Low
**Lines:** 2008–2016
`ctxAction('tap')`, `ctxAction('hand')`, etc. are called from hardcoded HTML buttons in the context menu markup. Since these are static strings from the HTML template (not user input), there is no injection risk. The action is dispatched via `if` comparisons, not `eval`.
**Action:** No change needed. The pattern of using string literals in onclick attributes for pre-defined actions is safe here.

### `ctxTarget` is a module-level variable holding an internal card ID
**Severity:** Low
**Lines:** 1999, 2016
`ctxTarget` holds a battlefield card ID. This value originates from game state (not user input), so there is no XSS risk. However, if the ID type were ever changed to a user-supplied string (e.g., a custom name), all callers would need to be reviewed.
**Action:** Document that `ctxTarget` must always hold an internal ID, not a user-controlled string.

## Summary
No security issues. All data flowing through the context menu is internally generated (card IDs, action strings from static HTML). The implementation is safe.
