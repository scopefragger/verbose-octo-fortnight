# Patterns Review — Init
Lines: 1050–1055 | File: public/mtg-commander.html

## Findings

### Inline arrow function rather than named init function
**Severity:** Low
**Lines:** 1051–1055
The `DOMContentLoaded` handler uses an anonymous arrow function. Naming it (e.g. `function init() { ... }`) would improve stack traces and make it easier to identify in profiling tools.
**Action:** Extract to `function init() { ... }` and pass it by reference: `document.addEventListener('DOMContentLoaded', init)`.

## Summary
The init block is clean and follows a conventional pattern. The single patterns finding is low severity: naming the handler function would improve debuggability.
