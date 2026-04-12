# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` couples view switching with game initialisation
**Severity:** Medium
**Lines:** 1540
`setMode()` is responsible for toggling UI visibility (DOM class manipulation), but it also calls `startGame()` as a side-effect when entering play mode and the library is empty. This mixes two concerns — view state and game-state mutation — inside a single function. If `setMode('play')` is called a second time (e.g. by the user clicking the Play button again), `playLibrary.length === 0` will be false once the game is running, so `startGame()` will not be called again. That conditional is a guard, but the guard logic encodes game-state knowledge inside a view-switching function.
**Action:** Extract the `startGame()` call from `setMode()` into the button's `onclick` handler, or add a dedicated `enterPlayMode()` function that calls both `setMode('play')` and `startGame()` when appropriate. `setMode()` should only manage view state.

### `toggleSidebar` belongs at a different layer
**Severity:** Low
**Lines:** 1543–1545
`toggleSidebar()` manipulates the `.layout` element's class — it is a layout-level concern. However, `setMode()` already manipulates the same `.layout` element (line 1539). Having two functions both reach into `.layout` without coordination increases the risk of conflicting state.
**Action:** Centralise all `.layout` class mutations in `setMode()` or a dedicated `updateLayoutClasses(mode, sidebarVisible)` helper so all layout changes are co-located and auditable.

## Summary
The main architectural issue is that `setMode()` conflates view-switching with game initialisation. The two-line `toggleSidebar()` function is also misplaced relative to the layout manipulation already done in `setMode()`. Refactoring would improve clarity and reduce future coupling risks.
