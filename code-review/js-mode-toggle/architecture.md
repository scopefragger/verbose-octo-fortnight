# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` has a side-effect of starting the game
**Severity:** Low
**Lines:** 1540
`setMode('play')` calls `startGame()` as a side effect when switching to play mode for the first time. This mixes view-state management (which panels are visible) with game-state initialization (shuffling the library, drawing opening hand). These are conceptually separate concerns: switching a view should not trigger game mechanics.
**Action:** Extract game initialization to a separate explicit call, or at minimum add a comment explaining that `setMode` doubles as the game-start trigger.

### `toggleSidebar` and `setMode` both manipulate the same `.layout` class
**Severity:** Low
**Lines:** 1539, 1544
Both functions directly mutate `document.querySelector('.layout').classList`, creating two separate code paths that must stay in sync for the sidebar state. If a third function needed to affect the sidebar, there would be three separate places to update.
**Action:** Consider a dedicated `setSidebarCollapsed(bool)` helper to centralize sidebar state management.

## Summary
The mode toggle section is functionally simple but conflates view-mode switching with game initialization. Both concerns could be separated for clarity. The dual manipulation of `.layout` by two different functions is a minor coupling issue.
