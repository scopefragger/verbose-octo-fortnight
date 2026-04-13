# Architecture Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `selectBFCard` and `selectHandCard` duplicate identical DOM population logic
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both functions set the same five focus panel DOM elements (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`) with the same pattern. The only difference is the action buttons. This is duplicated code that should be extracted.
**Action:** Extract a `populateFocusPanel(card)` helper that sets the common fields, then have each function call it before setting their own action buttons.

### Focus panel state is split between module globals and DOM
**Severity:** Medium
**Lines:** 1933, 1944, 1959, 1969–1970
`selectedBFId` and `selectedHandIdx` track which item is "focused" in module-level variables, while the actual displayed content lives in the DOM. There is no single source of truth: if `playBattlefield` is mutated and `renderBattlefield()` is not called, the focus panel can show stale data.
**Action:** When opening the focus panel, store the focused card object (not just its ID/index) so the panel can be refreshed independently.

### `selectBFCard` calls `renderBattlefield()` at the end to update selection highlight
**Severity:** Low
**Lines:** 1955
Calling `renderBattlefield()` on every card selection re-renders the entire battlefield to update a single CSS class. For large battlefields this is unnecessary work.
**Action:** A targeted DOM update (add/remove `selected` class on affected elements) would be more efficient than a full re-render.

## Summary
The most impactful architectural issue is the code duplication between `selectBFCard` and `selectHandCard` for populating the focus panel. Extracting `populateFocusPanel(card)` would reduce both duplication and the risk of the two paths diverging.
