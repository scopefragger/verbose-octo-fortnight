# Architecture Review — js-mode-toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` triggers `startGame()` as a side effect
**Severity:** Medium
**Lines:** 1540
`setMode` is responsible for switching UI panels, but it also conditionally starts a game session by calling `startGame()`. This is a mixed responsibility: a view-switching function should not contain game-state mutation logic. If a user navigates to play mode multiple times, this conditional guards against re-starting, but the intent is not immediately obvious.
**Action:** Move the `startGame()` call to the click handler that invokes `setMode('play')`, making the caller responsible for deciding whether to start a game. Or add a clear comment explaining why `setMode` triggers `startGame`.

### `toggleSidebar` belongs in UI/layout logic but has no counterpart
**Severity:** Low
**Lines:** 1543–1545
The function only removes the collapsed class; the class is added by `setMode` when switching to play mode. These two functions are coupled — `setMode` collapses, `toggleSidebar` expands — but they are not clearly linked by naming or comment.
**Action:** Co-locate or cross-reference these related operations with a comment, or consolidate sidebar state management into a single function.

## Summary
The section is small but contains a mild responsibility violation: `setMode` does both view switching and game initialisation. Separating these concerns would make the code easier to reason about.
