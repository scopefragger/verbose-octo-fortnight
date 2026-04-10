# Security Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxAction` uses string comparison for action dispatch — no injection risk
**Severity:** N/A
**Lines:** 2011–2015
The `action` parameter in `ctxAction` is compared against a fixed set of string literals (`'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'`). Since the function is only called from inline onclick attributes in the HTML menu, and no user-supplied data flows through the action string, there is no injection risk.

### No user data is rendered or injected in this section
**Severity:** N/A
**Lines:** 1996–2021
This section only manages menu position and dispatches card actions. No user data or API data is interpolated into HTML or executed. There are no XSS or injection risks.

## Summary
No security issues found. The context menu only handles positional calculations and action dispatch — no user data is rendered or injected.
