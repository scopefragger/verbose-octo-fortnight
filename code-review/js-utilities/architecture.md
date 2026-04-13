# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` and `escapeQuotes` are defined at the end of the file
**Severity:** Medium
**Lines:** 2142–2147
`escapeHtml` and `escapeQuotes` are used throughout the entire file (in HTML generation functions hundreds of lines earlier) but are defined at the very end. Because these are regular function expressions (not `function` declarations), they are not hoisted. The code works because `escapeHtml` is only called inside other functions that are not invoked until after the file is fully parsed, but the definition placement is still confusing and fragile.
**Action:** Move utility function definitions to the top of the `<script>` block so they are visually available before any function that uses them.

### `showToast` is a UI utility mixed with pure string utilities
**Severity:** Low
**Lines:** 2149–2155
`escapeHtml`, `escapeQuotes`, and `formatManaCostShort` are pure string utilities, while `showToast` is a DOM-manipulating UI function. Grouping them together in a "utilities" section conflates two different kinds of utilities.
**Action:** For a single-file app this is acceptable. If the file is ever split, these would go into different modules.

### `toastTimer` is a module-level variable without documentation
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared without a type annotation or comment. Its purpose is obvious from context, but a brief comment would help.
**Action:** Add `// Debounce handle for auto-dismissing the toast` above the declaration.

## Summary
The main architectural issue is the late definition of frequently-used utility functions. Moving them to the top of the script block would make the code's dependencies clearer without any functional change. The mixed DOM/string utility grouping is a minor organizational concern.
