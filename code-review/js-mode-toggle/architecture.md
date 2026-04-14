# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode` controls both UI and game-start logic
**Severity:** Medium
**Lines:** 1540
`setMode()` is responsible for toggling UI visibility but also triggers `startGame()` when switching to play mode. This couples view switching with game initialization logic. If the conditions for starting a game change, `setMode` must be edited even though it should only own view state.
**Action:** Extract the `startGame()` call into the caller (the button/handler that invokes `setMode('play')`), or introduce a dedicated `onEnterPlayMode()` hook so `setMode` remains a pure view controller.

### `toggleSidebar` modifies layout state without notifying other components
**Severity:** Low
**Lines:** 1543–1545
The sidebar toggle only manipulates the DOM class. If any other part of the app needs to know whether the sidebar is open (e.g., for responsive layout calculations or keyboard shortcuts), there is no event or state variable to query.
**Action:** Consider maintaining a `sidebarOpen` boolean in application state and updating it in `toggleSidebar`, even if only one function currently cares.

## Summary
`setMode` conflates view routing with game initialization, which will make it harder to add future modes (e.g., a draft mode or spectator view). The section is small enough that the coupling is manageable now, but separating concerns would improve maintainability.
