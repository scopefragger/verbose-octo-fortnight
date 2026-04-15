# Architecture Review — Utilities
Lines: 2141–2156 (plus `formatManaCostShort` at 1642–1645) | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is defined 500 lines before the utilities section
**Severity:** Low
**Lines:** 1642–1645
`formatManaCostShort` is described in the Utilities segment but is physically located at line 1642 — between the play-state mana functions and `COMMON_TOKENS`. This placement is inconsistent with the stated purpose of the Utilities section as a home for shared helper functions.
**Action:** Move `formatManaCostShort` to the Utilities section (near `escapeHtml`, `escapeQuotes`) for co-location of all utility functions.

### `escapeHtml` and `escapeQuotes` are placed at the bottom of the file but are used throughout
**Severity:** Medium
**Lines:** 2141–2147
These utilities are defined at the end of the script (lines 2141–2147) but are called hundreds of lines earlier (e.g. `bfCardHTML` at line 1882, `renderPlayHand` at 1912). This works in JavaScript because function declarations and `const`/`let` assignments at module scope are available (hoisted) before the function bodies execute, but it creates a maintenance risk: if a developer reads the code top-to-bottom, they encounter `escapeHtml` calls long before seeing its definition.
**Action:** Move `escapeHtml`, `escapeQuotes`, `formatManaCostShort`, and `showToast` to the top of the JavaScript section (after constant declarations) so utilities are defined before use.

### `toastTimer` leaks into module scope unnecessarily
**Severity:** Low
**Lines:** 2149
`toastTimer` is a module-level `let` that exists solely to support `showToast`. Wrapping both in an IIFE or using a closure would contain the variable and make the dependency explicit.
**Action:** Wrap toast logic in a self-contained IIFE:
```js
const showToast = (() => {
  let timer;
  return (msg, isError = false) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    clearTimeout(timer);
    timer = setTimeout(() => { el.className = 'toast'; }, 3000);
  };
})();
```

## Summary
The primary architectural concern is utility functions being defined after their call sites. Moving all utilities to the top of the JS section would improve readability. The `formatManaCostShort` displacement to a non-utilities location is a minor organization issue.
