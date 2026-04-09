# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Utility functions defined at the end of the file — used throughout
**Severity:** Low
**Lines:** 2141–2156
`escapeHtml`, `escapeQuotes`, `formatManaCostShort`, and `showToast` are defined at the end of the file (lines 2141–2156) but are called from lines as early as 1484. In a standard script (non-module, non-ESM), function declarations are hoisted, but `escapeHtml` and `escapeQuotes` are function declarations (not arrow functions), so hoisting applies. However, `formatManaCostShort` at line 1642 is also a function declaration and is used at line 1711 and 1916 — all fine due to hoisting. This is technically correct but counter-intuitive: convention places utilities at the top of a file.
**Action:** No action required for correctness, but consider moving utility functions to the top of the script block for discoverability.

### No utility namespace or module — all functions are global
**Severity:** Low
**Lines:** 2141–2156
All utility functions are defined at the top level of the script tag with no namespace. In a larger codebase this could cause naming collisions. For a single-file app with a single `<script>` tag this is expected and acceptable.
**Action:** No action required. Document as an intentional single-file convention.

### `showToast` manages its own timer with a module-level variable
**Severity:** Low
**Lines:** 2149–2155
The `toastTimer` module-level variable creates a self-contained timer pattern within `showToast`. This is functional but could be encapsulated as an IIFE or a closure if utilities were refactored. Not a bug, but worth noting.
**Action:** No action required at current scale.

## Summary
The utilities section is architecturally appropriate for a single-file vanilla JS app. The primary concern is the `escapeHtml` security gap (covered in the security review), not architectural issues. Function placement at the end is counter-intuitive but functionally correct due to hoisting.
