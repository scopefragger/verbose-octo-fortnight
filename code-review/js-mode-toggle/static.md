# Static Code Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `toggleSidebar` always removes `sidebar-collapsed`, never adds it
**Severity:** Medium
**Lines:** 1543–1545
`toggleSidebar()` unconditionally calls `classList.remove('sidebar-collapsed')`. The function name implies toggling (adding OR removing) but it only ever removes the class — it can never collapse the sidebar. If it is intended purely as a "show sidebar" action, the name is misleading.
**Action:** Rename to `showSidebar()` if that is the intended behaviour, or add proper toggle logic: `classList.toggle('sidebar-collapsed')`.

### No null guard on `document.querySelector('.layout')`
**Severity:** Low
**Lines:** 1539, 1544
Both functions call `document.querySelector('.layout')` without checking for null. If the `.layout` element is absent from the DOM (e.g., during early init or after a DOM manipulation), this will throw a TypeError.
**Action:** Add a null guard: `const layout = document.querySelector('.layout'); if (!layout) return;`.

### `setMode` calls `startGame()` conditionally but `startGame` is not defined in this segment
**Severity:** Low
**Lines:** 1540
`startGame()` is called when switching to play mode if `playLibrary` is empty and `deckLoaded` is truthy. The function is defined elsewhere in the file, but if the call order or load context ever changes, this could fail silently. Also, `deckLoaded` is a global variable — its definition/truthiness is assumed.
**Action:** Verify `deckLoaded` is always initialised before `setMode` is called. Low risk given single-file architecture but worth a note.

## Summary
The main bug is `toggleSidebar` which only removes the class rather than toggling it — the function's name and behaviour are mismatched. Null guards on querySelector results would improve robustness.
