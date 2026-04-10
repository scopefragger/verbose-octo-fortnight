# Architecture Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool()` calls `renderPlayHand()` as a side effect
**Severity:** Medium
**Lines:** 1634
`renderManaPool()` is responsible for updating the mana pool display, but it also calls `renderPlayHand()` to refresh affordability indicators in the hand. This creates a tight coupling between two separate rendering concerns: the mana pool display should not need to know about hand rendering.
**Action:** Remove the `renderPlayHand()` call from `renderManaPool()`. Instead, have callers of `renderManaPool()` also call `renderPlayHand()` when needed, or create a higher-level `renderPlayState()` function that calls both.

### Play-state variables mixed with control variables
**Severity:** Low
**Lines:** 1555–1557
`ctxTarget`, `selectedBFId`, and `selectedHandIdx` are UI interaction state variables (tracking which card is selected/right-clicked), but they are declared alongside pure game-state variables (`playLibrary`, `playHand`, etc.). These are different conceptual layers.
**Action:** Group and comment variables by their purpose: game state vs. UI selection state.

### `spendMana` drain order is hardcoded
**Severity:** Low
**Lines:** 1614
The order in which colors are drained when paying generic costs (`['C','G','R','B','U','W']`) is hardcoded. This is a design decision with gameplay implications (auto-spending order), but it is not documented.
**Action:** Add a comment explaining the intentional drain order, or expose it as a named constant.

## Summary
The main architectural concern is `renderManaPool` triggering a hand re-render as a side effect — these two rendering concerns should be kept separate. The section otherwise follows the file's conventions.
