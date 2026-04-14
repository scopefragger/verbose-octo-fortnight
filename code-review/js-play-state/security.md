# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` injects `MANA_COLOR_STYLES` values into inline style without sanitisation
**Severity:** Low
**Lines:** 1630
The inline style `color:${MANA_COLOR_STYLES[c]}` injects values from the `MANA_COLOR_STYLES` constant. These values are hard-coded strings controlled entirely by the developer, so there is no real attack surface. However, if `MANA_COLOR_STYLES` were ever sourced from user input or external data, the inline-style injection would become an XSS vector.
**Action:** No immediate action needed. Document that `MANA_COLOR_STYLES` must remain a static developer-controlled constant.

## Summary
No significant security issues. All data rendered in this section comes from static developer-defined constants (`MANA_COLOR_STYLES`, `MANA_COLORS`) or numeric mana pool values — no user-supplied input is injected into the DOM.
