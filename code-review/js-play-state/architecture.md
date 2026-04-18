# Architecture Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` triggers `renderPlayHand` as a hidden side effect
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` calls `renderPlayHand()` at the end to update hand-card affordability indicators. While the comment explains the why, this creates a hidden cross-section dependency: updating the mana display always re-renders the entire hand. If `renderPlayHand` is ever expensive or has side effects of its own, every mana-change operation pays that cost unexpectedly.
**Action:** Expose affordability-indicator updates as a separate lightweight function (e.g., `updateHandAffordability()`) that only iterates hand cards and toggles a CSS class, rather than re-rendering the entire hand DOM.

### Global mutable play-state with no encapsulation
**Severity:** Low
**Lines:** 1548–1558
`playLibrary`, `playHand`, `playBattlefield`, `playGraveyard`, `playExile`, `manaPool`, and related scalars are bare module-level `let` variables. Any function in the 2159-line file can read or mutate them. This makes it hard to reason about which code owns each variable.
**Action:** No immediate change required for a single-file app, but consider grouping into a `playState` object (`playState.library`, `playState.hand`, etc.) to make ownership explicit.

## Summary
The main architectural concern is the hidden call from `renderManaPool` to `renderPlayHand` — this couples mana display to full hand re-render in a non-obvious way. The global state variables are a single-file app inevitability but could benefit from grouping.
