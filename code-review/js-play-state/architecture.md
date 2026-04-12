# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` contains both state-read and DOM-render logic in the same function, then triggers a second render
**Severity:** Medium
**Lines:** 1623–1635
`renderManaPool()` reads global `manaPool` state, writes to the `mana-pool-pips` element, and then unconditionally calls `renderPlayHand()`. This means changing mana state (via `spendMana` or `clearManaPool`) always re-renders the entire play hand as a side effect. The render of the hand is an implicit dependency hidden inside what looks like a focused "render mana pool" function.
**Action:** Either rename the function to `renderManaAndHand()` to make the dual purpose explicit, or split it: have callers that need to refresh both call each render function separately. This also removes the circular-call risk noted in the static review.

### Global mutable state variables are all module-level `let` declarations
**Severity:** Low
**Lines:** 1548–1558
All play state (`playHand`, `playBattlefield`, `manaPool`, etc.) lives as top-level `let` variables. In a single-file app this is acceptable, but there is no encapsulation — any function anywhere in the file can read or mutate `playLife`, `playTurn`, etc. without going through any accessor or event.
**Action:** For the current single-file design, group all play state into a single `const playState = { ... }` object. This makes the ownership boundary visible and enables a single `resetPlayState()` function, reducing scattered mutation.

### `getLandMana` is a pure utility function living next to play state declarations
**Severity:** Low
**Lines:** 1563–1578
`getLandMana` doesn't reference any of the module-level play variables — it is a pure card-data utility. Its placement next to the stateful variables suggests it ended up here by convenience rather than by design. The `parseMana` function has the same character.
**Action:** Consider grouping pure mana/card utilities (`getLandMana`, `parseMana`) in a clearly labelled `// === MANA UTILITIES ===` sub-section, separate from the stateful variable declarations. In a single-file app this is a naming/sectioning concern, not a refactor.

### `spendMana` and `canAfford` share `parseMana` but are not composed
**Severity:** Low
**Lines:** 1593–1621
`canAfford` and `spendMana` both call `parseMana` on the same `manaCost` and then process the result independently. A caller that wants to "check then spend" must call `parseMana` twice (once inside each function). Composing them (e.g. `spendMana` calling `canAfford` first and returning early) would centralise the double-call and enforce the pre-condition.
**Action:** Have `spendMana` call `canAfford(manaCost)` at the top and return `false` if it fails. This makes the pre-condition explicit and eliminates the need for callers to guard separately.

## Summary
The section correctly separates state initialization from mana logic functions. The main architectural concern is the hidden side-effect in `renderManaPool` (calling `renderPlayHand`), which creates an implicit render dependency. Grouping pure utilities away from stateful variables would improve readability without requiring a larger refactor.
