# Architecture Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Duplicated card-data-to-DOM writes in `selectBFCard` and `selectHandCard`
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both functions populate the same focus panel DOM elements (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`) with identical logic using the same element IDs. The only difference is the source card object (`bfc.card` vs. `card`).
**Action:** Extract to a shared helper: `function populateFocusPanelCard(card) { ... }`. Both functions call it, then each builds its own action buttons independently.

### `selectBFCard` mixes selection with tap behaviour
**Severity:** Low
**Lines:** 1931
```js
if (selectedBFId === id) { tapCard(id); return; }
```
Clicking an already-selected card silently triggers `tapCard()`. This embeds a secondary behaviour (tapping) inside the selection function. If the desired click behaviour changes (e.g., deselect instead of tap), this line must be found and changed inside `selectBFCard` rather than at the call site.
**Action:** Move the "double-click to tap" logic to the caller (the onclick attribute on the card HTML element) or make it explicit at the call site. `selectBFCard` should only handle selection.

## Summary
The two `select*` functions duplicate the focus-panel DOM update logic. Extracting `populateFocusPanelCard(card)` would eliminate the duplication and make each function responsible for only the parts that differ (action buttons and state management).
