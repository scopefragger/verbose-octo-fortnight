# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utility functions are at the bottom of the file but used throughout
**Severity:** Low
**Lines:** 2141–2156
`escapeHtml` and `escapeQuotes` are used from line ~1300 onwards but defined at the very end of the file (line 2142). In a non-module script, function declarations are hoisted, so this works. However, `formatManaCostShort` (line 1642) is defined much earlier, breaking the pattern of utility functions being together at the end.
**Action:** Group all utility functions together — either at the top (after constants) or at the bottom in a dedicated block. `formatManaCostShort` should be moved to the Utilities section.

### `showToast` manages its own timer via a module-level variable
**Severity:** Low
**Lines:** 2149–2155
The `toastTimer` variable is a module-level side effect tied to `showToast`. This is a hidden dependency — any code that accidentally reassigns `toastTimer` would break toast auto-dismiss.
**Action:** Encapsulate `toastTimer` within a closure or IIFE around `showToast` to prevent accidental interference.

### No general error display utility — `showToast` used for both success and error
**Severity:** Low
**Lines:** 2150
`showToast(msg, isError)` handles both success and error notifications via a boolean flag. This is a simple and functional approach but means error handling is not differentiated at the call site.
**Action:** The current approach is acceptable for a single-file family tool. If notification types grow, consider `showSuccess(msg)` / `showError(msg)` wrappers.

## Summary
The utilities section is small and fit-for-purpose. The main architectural concern is the scattered placement of utility functions (`formatManaCostShort` at line 1642, escaping functions at line 2141), which should be consolidated for discoverability.
