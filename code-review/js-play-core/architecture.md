# Architecture Review — Play Core
Lines: 1664–1841 | File: public/mtg-commander.html

## Findings

### `showManaChoicePicker` owns focus-panel rendering responsibilities
**Severity:** Medium
**Lines:** 1771–1796
`showManaChoicePicker` reaches directly into the focus panel DOM (`focus-img`, `focus-name`, `focus-type`, `focus-oracle`, `focus-mana`, `focus-actions`, `card-focus-panel`) and partially replicates the population logic from `selectBFCard()` (Section 18). This is a cross-section responsibility leak: focus panel population belongs in the Card Focus Panel section, not in Play Core's mana interaction function.
**Action:** Refactor so `showManaChoicePicker` calls `selectBFCard(id)` for panel setup, then calls a separate `setFocusActions(html)` helper to inject the color-picker buttons. This keeps panel ownership in Section 18 and makes `showManaChoicePicker` responsible only for constructing the button HTML.

### `changeLife` writes directly to the DOM instead of using the render pipeline
**Severity:** Low
**Lines:** 1684–1687
All other state mutations (draw card, untap, end turn, play card, etc.) go through `renderPlayArea()` which synchronises all DOM counters from state. `changeLife` is the only mutation function that writes to the DOM directly, bypassing the render pipeline. This makes it easy to accidentally leave the life counter stale if `renderPlayArea` is later called before `changeLife`.
**Action:** Remove the `document.getElementById('life-counter').textContent = playLife` line from `changeLife` and rely on `renderPlayArea()` for display synchronisation. If a lightweight update is needed (e.g. for performance), add a comment explaining the intentional bypass.

### `endTurn` hard-codes the "draw a card" mechanic
**Severity:** Low
**Lines:** 1695–1702
`endTurn` combines turn increment, untap-all, mana-pool clear, and card draw in a single function. Card draw on end-of-turn is not universal (it's actually the draw at the start of the *next* turn in Magic). This conflation makes it hard to add optional behaviours like "skip draw step" or "draw extra card" without modifying the core function.
**Action:** Consider extracting `drawCard` as a distinct callable and having `endTurn` call it optionally, or at minimum rename the toast to `Turn ${playTurn} — start turn` to reflect that the draw is actually a beginning-of-turn draw.

### Duplicate token-is-filtered logic across `sendToGrave`, `sendToExile`, `returnToHand`, `putOnTop`
**Severity:** Low
**Lines:** 1798–1841
All four zone-transition functions repeat the same pattern: find by id, splice, check `!c.isToken` before pushing to destination. The token-filter guard (`if (!c.isToken)`) is duplicated four times.
**Action:** Extract a helper `removeBFCard(id)` that returns `{ card: c.card, isToken: c.isToken }` after splicing from `playBattlefield`. Each zone function then calls it and conditionally pushes: `const removed = removeBFCard(id); if (!removed) return; if (!removed.isToken) destination.push(removed.card);`

## Summary
The Play Core section is cohesive but has two architectural concerns: `showManaChoicePicker` reaches across section boundaries into focus-panel DOM ownership, and the four zone-transition functions repeat an identical splice-then-filter-token pattern that should be extracted into a shared helper. The `changeLife` direct-DOM-write inconsistency is minor but breaks the render-pipeline contract maintained everywhere else.
