# Static Code Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` accepts any string without validation
**Severity:** Low
**Lines:** 1532–1533
`mode` is compared only against the string `'play'`, so any value other than `'play'` silently activates "prepare" mode. Passing a typo like `setMode('Play')` or `setMode('prep')` would activate prepare mode without error, potentially hiding caller-side bugs.
**Action:** Add a guard at the top: `if (mode !== 'play' && mode !== 'prepare') { console.warn('setMode: unknown mode', mode); return; }`

### `toggleSidebar()` only removes the collapsed class — cannot re-collapse
**Severity:** Medium
**Lines:** 1543–1545
`toggleSidebar()` always removes `sidebar-collapsed` regardless of the current state. Despite being named "toggle", it is actually a one-directional "expand" operation. There is no way to re-collapse the sidebar via this function.
**Action:** Change the body to `document.querySelector('.layout').classList.toggle('sidebar-collapsed')` to make the function behave as its name implies; or rename it `expandSidebar()` if one-directional behaviour is intentional.

### Dependency on undeclared globals `playLibrary`, `deckLoaded`, `startGame`
**Severity:** Low
**Lines:** 1540
`setMode` references `playLibrary`, `deckLoaded`, and `startGame()` which are defined elsewhere in the file. In a single-file app these work at runtime, but there is no visible declaration or import, making it non-obvious what state `setMode` depends on.
**Action:** Add a brief comment noting the external state dependencies, or group the mode-toggle logic with the play-state section (segment 14) where these variables are defined.

### `document.querySelector('.layout')` called twice without caching
**Severity:** Low
**Lines:** 1539, 1544
The `.layout` element is queried from the DOM twice (once in `setMode`, once in `toggleSidebar`) without caching. For a frequently called toggle this is a minor inefficiency.
**Action:** Cache the element at module initialisation: `const layoutEl = document.querySelector('.layout');` and reference that constant in both functions.

## Summary
The section is compact and mostly correct, but `toggleSidebar` is misleadingly named (it only expands, never collapses), and `setMode` silently accepts invalid mode strings. The reliance on several globals defined elsewhere in the file is manageable in a single-file app but worth documenting.
