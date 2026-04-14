# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### All play-mode state declared as bare module-level variables
**Severity:** Medium
**Lines:** 1548–1558
`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `playTurn`, `playLife`, `ctxTarget`, `selectedBFId`, `selectedHandIdx`, and `manaPool` are all declared as top-level `let`/`const` in the global script scope. Any function in the file can mutate them directly, making it hard to trace state changes and impossible to reset game state cleanly (e.g., for a "restart" feature) without reassigning each variable individually.
**Action:** Group play-mode state into a single object (e.g., `const playState = { library: [], hand: [], ... }`) so it can be reset atomically and accessed by an explicit reference, making the data flow clearer.

### `renderManaPool` directly calls `renderPlayHand` — creates tight render coupling
**Severity:** Low
**Lines:** 1634
`renderManaPool` reaches into the rendering layer for the hand (`renderPlayHand`). This creates a coupling where a state-change function for mana also owns the knowledge that "hand display depends on mana". A cleaner approach would be an event bus or a single `renderPlayArea()` call site that renders everything coherently.
**Action:** Either call `renderPlayArea()` (which already orchestrates all play renders) or use a dirty-flag + requestAnimationFrame pattern to batch DOM updates.

### Mana logic (parse, afford, spend) is co-located with play state declarations
**Severity:** Low
**Lines:** 1580–1640
The mana parsing and spending functions are pure logic (no DOM interaction) but are defined in the same block as DOM-mutating rendering functions. This makes the section harder to unit-test or reason about independently.
**Action:** Group pure logic functions (`parseMana`, `canAfford`, `getLandMana`) separately from DOM functions (`renderManaPool`, `clearManaPool`).

## Summary
The play state section suffers from the common single-file app problem of scattered global mutable state. Grouping state into a single object and separating pure mana logic from DOM rendering would significantly improve maintainability as the play-mode feature grows.
