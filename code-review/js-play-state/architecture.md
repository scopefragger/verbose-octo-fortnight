# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` has a render side-effect that calls `renderPlayHand`
**Severity:** Medium
**Lines:** 1623–1635
`renderManaPool()` calls `renderPlayHand()` at the end to refresh affordability indicators. This creates an implicit render dependency chain: changing the mana pool triggers a full hand re-render. This makes it hard to reason about render triggers and can cause unexpected double renders.
**Action:** Separate the concerns — have the caller (e.g., a `tapLand()` function) call both `renderManaPool()` and `renderPlayHand()` explicitly in sequence, rather than embedding the call inside `renderManaPool`.

### Play state variables are not grouped into a state object
**Severity:** Low
**Lines:** 1548–1558
`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, and `manaPool` are all separate top-level `let` declarations. This makes it hard to reset the entire game state or serialize it.
**Action:** Consider grouping play state into a single `playState` object with a `resetPlayState()` factory function.

### `parseMana` and `getLandMana` are business logic mixed with render-adjacent code
**Severity:** Low
**Lines:** 1563–1591
These pure functions (no DOM interaction) are defined in the play state section alongside mutable state variables, which makes the file harder to navigate. They would be better placed in a utilities or game-logic section.
**Action:** Move pure computation functions to the utilities section.

## Summary
The main architectural issue is `renderManaPool` calling `renderPlayHand` as a hidden side-effect, creating an implicit render chain. Grouping play state into a single object and isolating pure functions would also improve maintainability.
