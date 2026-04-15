# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` triggers `renderPlayHand` — render function causes cascade
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` unconditionally calls `renderPlayHand()` to refresh affordability indicators. This tight coupling means rendering the mana pool always re-renders the entire hand, even when called from `clearManaPool` (which doesn't change hand contents). This creates an unnecessary cascade and makes the call graph harder to reason about.
**Action:** Decouple the two render functions. Either pass a flag (`renderManaPool(refreshHand = true)`) or emit an event/call an `updateAffordability()` helper that only updates CSS classes on existing hand cards rather than re-rendering the full hand.

### Global mutable state for play session
**Severity:** Low
**Lines:** 1548–1558
All play-session state (`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, `manaPool`) is scattered as module-level globals. There is no encapsulating object or reset function.
**Action:** Consider grouping play state into a single `playState` object with a `resetPlayState()` factory function. This makes state transitions explicit and simplifies future serialization (e.g. save/resume game).

### `getLandMana` belongs to the land-tap flow, not mana-cost parsing
**Severity:** Low
**Lines:** 1563–1578
`getLandMana` is grouped with mana-cost utilities (`parseMana`, `canAfford`, `spendMana`) but is conceptually part of the land-tapping action in the play-core section. Its placement here slightly misrepresents the section's purpose.
**Action:** Move `getLandMana` to the play-core section (or co-locate with the tap-land action) to better reflect where it is consumed.

## Summary
The main architectural concern is the render cascade where `renderManaPool` forces a full hand re-render. The global play-state variables work for a single-user single-game scenario but will become problematic if game-save/resume or multi-game support is added.
