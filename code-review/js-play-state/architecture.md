# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` triggers a full `renderPlayHand` on every call
**Severity:** Medium
**Lines:** 1634
`renderManaPool` calls `renderPlayHand()` at the end to refresh affordability indicators. This creates a hidden render dependency: every mana state change re-renders the entire hand. If `renderPlayHand` is itself expensive (iterating cards, building HTML), this could cause unnecessary repaints — particularly problematic in `spendMana`, which calls `renderManaPool` after each deduction.
**Action:** Consider passing a flag to `renderManaPool` to suppress the hand refresh when called from bulk-update paths, or decouple affordability indicators into a lighter update function.

### State mutation and rendering mixed in `spendMana`
**Severity:** Low
**Lines:** 1606–1621
`spendMana` mutates `manaPool` and then triggers rendering via `renderManaPool`. This blends mutation and render concerns in one function. In the current architecture this is acceptable, but it makes unit testing impossible and makes call-site reasoning harder.
**Action:** For future maintainability, separate `spendManaState(manaCost)` (pure mutation) from the render call, even if the render call is kept in the same wrapper function.

### Global play state is not reset on mode change
**Severity:** Medium
**Lines:** 1548–1558
There is no visible reset function in this section for the global play-state variables. If the user navigates away from play mode and back, stale state may remain. (A reset function may exist elsewhere in the file — if so, this is not an issue.)
**Action:** Verify that a `resetPlayState()` or equivalent is called when entering/exiting play mode. If not, add one that reinitialises all `let` variables to their default values.

## Summary
The primary architectural concern is the implicit coupling between `renderManaPool` and `renderPlayHand` — a mana change always re-renders the hand, which may be unnecessarily expensive. The mixed mutation/render pattern in `spendMana` is a minor concern for testability.
