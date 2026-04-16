# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is not co-located with the other utilities
**Severity:** Low
**Lines:** 1642 (actual definition), 2141 (section start)
The utilities section description lists `formatManaCostShort` but it lives at line 1642, embedded between game-state initialisation and `COMMON_TOKENS`. It is a pure formatting utility with no dependency on surrounding game state. Its misplacement means developers looking for utilities will not find it here.
**Action:** Move `formatManaCostShort` to the utilities section (after line 2141) and update any comments referencing its location.

### `escapeHtml` and `escapeQuotes` are defined at the bottom of the file but used throughout
**Severity:** Medium
**Lines:** 2142–2147
Both escaping functions are defined near line 2142 but called hundreds of lines earlier (e.g. segment 21 at line 2047, segment 22 at line 2118). In JavaScript, `function` declarations hoist so this works at runtime, but it violates the "define before use" reading convention and means a reviewer reading the file top-to-bottom encounters the callers before understanding the escaping contract.
**Action:** Consider moving utility functions to the top of the script block (after state declarations) so they are defined before first use, consistent with how utility-first coding convention improves readability. Alternatively, document the hoisting dependency with a comment at the top of the script.

### `showToast` couples display logic to a global timer variable
**Severity:** Low
**Lines:** 2149–2155
`toastTimer` is a module-level variable used only by `showToast`. It is not part of any shared state object and is not needed outside this function. Its module-level declaration makes it appear as significant shared state when it is merely an implementation detail of `showToast`.
**Action:** Consider enclosing `toastTimer` within a closure or IIFE so it is private to `showToast`:
```js
const showToast = (() => {
  let timer = null;
  return function(msg, isError = false) { ... clearTimeout(timer); timer = setTimeout(...); };
})();
```

### No utility for safe attribute escaping exists — gap in the escape toolkit
**Severity:** Medium
**Lines:** 2141–2147
The file has `escapeHtml` (for text nodes, incomplete) and `escapeQuotes` (incorrect for onclick contexts) but no function that safely escapes a string for use in an HTML attribute value. This gap is what drives the misuse of `escapeQuotes` throughout the file.
**Action:** Add an `escapeAttr(str)` function that escapes `&`, `<`, `>`, `"`, and `'` (all five HTML-special characters), and use it in all attribute-value interpolations. This is strictly a superset of `escapeHtml`.

## Summary
The utilities section is architecturally important because its two escaping functions are used throughout the file, but both have correctness issues that affect security. The missing `escapeAttr` function is the architectural gap that causes misuse elsewhere. Moving utilities to be defined before first use and encapsulating `toastTimer` would improve the section's own structure.
