# Architecture Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Render function (`renderManaPool`) mixed into state section
**Severity:** Medium
**Lines:** 1623–1635
`renderManaPool()` is a DOM rendering function but lives in the "Play State" section alongside pure data/logic functions. This blurs the boundary between state management and rendering.
**Action:** Move `renderManaPool()` to the "Render Play Area" section (lines 1858–1923) to co-locate all rendering logic. If moving is not desirable, add a clear comment explaining why it is here.

### `renderManaPool` triggers `renderPlayHand` — cascading render dependency
**Severity:** Medium
**Lines:** 1634
The mana pool renderer directly calls `renderPlayHand()`, creating a render cascade where any mana state change re-renders the entire hand. This tight coupling makes it hard to change either function independently.
**Action:** Consider a lightweight affordability-update pass that only updates card affordability flags on existing hand DOM nodes, rather than re-rendering the full hand.

### Global mutable play state with no encapsulation
**Severity:** Medium
**Lines:** 1547–1558
All play state variables (`playLibrary`, `playHand`, `playBattlefield`, etc.) are module-level globals. Any function in the file can read or write them without restriction.
**Action:** Consider grouping play state into a single `playState` object to make dependencies more explicit and easier to reset (e.g., `Object.assign(playState, defaultPlayState)`). This would also make state resets in `startPlay()` cleaner.

### `getLandMana` belongs in a data/utility layer
**Severity:** Low
**Lines:** 1563–1578
`getLandMana` is a pure data transformation function (card → mana map) but is embedded in the play state section. It would be better placed in a utilities section alongside `parseMana`.
**Action:** Move `getLandMana` and `parseMana` to the Utilities section (lines 2141–2156) for better discoverability.

## Summary
The Play State section mixes state declarations, business logic, and rendering code. The main architectural issues are the render cascade from `renderManaPool` to `renderPlayHand` and the unencapsulated global state. Separating pure logic from rendering would make this section easier to maintain and test.
