# Architecture Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### `setMode()` mixes view-switching with game initialisation
**Severity:** Medium
**Lines:** 1540
`setMode()` is responsible for switching the UI between Prepare and Play views, but also calls `startGame()` as a side effect when entering Play mode. This couples view-switching to game state initialisation. If the game ever needs to be (re)started independently of a mode switch, or if the mode is set programmatically without the intent to start a game, this side effect will fire unexpectedly.
**Action:** Extract the game-start trigger to the call-site (i.e. the button click handler that calls `setMode('play')`), keeping `setMode()` a pure view-switching function.

### `toggleSidebar()` is a separate function but belongs to the same mode-switching concern
**Severity:** Low
**Lines:** 1543–1545
The sidebar toggle manipulates the same `.layout` element and `sidebar-collapsed` class that `setMode()` already manages. Having two functions that both write to the same class on the same element creates an implicit state-sharing risk.
**Action:** Consider managing sidebar collapse state through `setMode()` or a shared state variable so all layout class mutations go through a single function.

## Summary
The Mode Toggle section is reasonably small, but `setMode()` violates single-responsibility by initiating game play as a side effect of a view transition. Sidebar collapse state is managed by two separate functions touching the same DOM element, which could lead to unexpected interactions.
