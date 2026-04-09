# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Global mutable state variables declared mid-file
**Severity:** Low
**Lines:** 1548–1558
`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, and `manaPool` are all declared as module-level `let` variables. In a single-file app this is expected, but grouping them in a dedicated state initialization block or state object (`const playState = { library: [], hand: [], ... }`) would make state resets and inspection significantly cleaner.
**Action:** Consider grouping all play-mode state into a single `playState` object with a `resetPlayState()` function, rather than scattered `let` declarations.

### `renderManaPool` is both a render and a render-coordinator function
**Severity:** Low
**Lines:** 1623–1635
`renderManaPool()` updates the mana pool UI and then calls `renderPlayHand()` to cascade the affordability update. This creates an implicit render dependency: callers of `renderManaPool` must know it will also trigger a hand re-render. A coordinating function like `updateManaAndHand()` would make this coupling explicit.
**Action:** Either document the cascading render in a comment or extract to a named coordinator.

### `getLandMana` is defined in the play state section but used in play core logic
**Severity:** Low
**Lines:** 1563–1578
`getLandMana()` is a data-transformation helper but is embedded in the play-state variable block. It would fit more naturally with the other card-action helpers (tap/play logic). Its placement here makes it easy to miss when reviewing the play action flow.
**Action:** Move or note that this utility belongs near the tap/play action handlers.

## Summary
The play state section handles mutable game state and mana logic reasonably but scatters related concerns: global variables are bare `let` declarations, `renderManaPool` has a hidden cascading render dependency, and `getLandMana` is misplaced relative to where it is consumed. These are maintainability issues rather than bugs.
