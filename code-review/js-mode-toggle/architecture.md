# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` directly manages multiple UI concerns
**Severity:** Low
**Lines:** 1532–1541
`setMode` toggles button active states, hides/shows panels, collapses the sidebar, and triggers game initialisation in a single function. These are separate concerns: presentation state (which panel is visible) and game state (starting the game). Starting the game as a side effect of a view-mode change is unexpected.
**Action:** Extract `if (isPlay && ...) startGame()` into the caller or into a dedicated "enter play mode" function so the side effect is explicit.

### Hard-coded element IDs couple mode logic to HTML structure
**Severity:** Low
**Lines:** 1534–1538
`setMode` references 5 specific element IDs. Any renaming of those IDs in HTML will silently break mode switching.
**Action:** Consider an array of element IDs to toggle or use data-attributes on the elements themselves to identify their mode visibility.

## Summary
The segment is small and mostly acceptable. The only architectural concern is the hidden side effect of calling `startGame()` from within a UI-mode-switching function — this is an unexpected coupling of view state and game logic.
