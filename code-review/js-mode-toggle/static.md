# Static Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` accepts any string without validation
**Severity:** Low
**Lines:** 1532–1533
`setMode(mode)` accepts any string and only tests `mode === 'play'`. Passing an unexpected value (e.g. `setMode('edit')`) silently treats it as prepare-mode without signalling an error. There are exactly two valid modes, but this is not enforced.
**Action:** Add a guard: `if (mode !== 'play' && mode !== 'prepare') { console.warn('Unknown mode:', mode); return; }` to make invalid callers immediately visible.

### `toggleSidebar()` only removes — never adds — `sidebar-collapsed`
**Severity:** Medium
**Lines:** 1543–1545
`toggleSidebar()` is named "toggle" but always *removes* `sidebar-collapsed`, making it a one-directional "show sidebar" function. It cannot hide the sidebar. Any call site expecting a true toggle will be broken.
**Action:** Either rename to `showSidebar()` to reflect its actual behaviour, or implement a real toggle: `document.querySelector('.layout').classList.toggle('sidebar-collapsed')`.

### `startGame()` called without checking `playLibrary` length truthiness correctly
**Severity:** Low
**Lines:** 1540
The condition `playLibrary.length === 0 && deckLoaded` correctly calls `startGame()` only when entering play mode with a loaded but not-yet-started game. However if `playLibrary` is undefined (before the play-state section initialises it), this throws. Execution order within the file determines whether this is safe.
**Action:** Add a defensive check: `if (isPlay && Array.isArray(playLibrary) && playLibrary.length === 0 && deckLoaded) startGame();`

## Summary
The section is small and mostly correct, but `toggleSidebar()` is misleadingly named — it only ever opens the sidebar. The missing input validation on `setMode()` and the potential undefined-array access are low-risk but worth addressing.
