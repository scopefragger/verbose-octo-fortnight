# Architecture Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` is a pure rendering function but accesses global `selectedBFId`
**Severity:** Medium
**Lines:** 1887
`bfCardHTML(bfc)` is a helper that generates HTML for a battlefield card, but it reads the global `selectedBFId` variable directly to determine if the card is selected. This makes the function impure — its output depends on external state, not just its argument. This is harder to test and reason about.
**Action:** Pass `selectedId` as a parameter: `bfCardHTML(bfc, selectedBFId)`. This makes the function's dependencies explicit.

### `renderPlayHand` includes affordability logic
**Severity:** Low
**Lines:** 1915
`renderPlayHand()` calls `canAfford(card.mana_cost)` inside the render loop. Affordability is a game-logic concern, not a rendering concern. The render function is making domain decisions.
**Action:** Pre-compute affordability as a property on each hand card (or pass it as a separate array), and have `renderPlayHand` consume that data rather than computing it inline.

### Inline empty-state HTML has inline styles
**Severity:** Low
**Lines:** 1873–1874, 1909
Empty states are rendered with inline `style="color:var(--text-dim);font-size:..."` strings. These duplicate styling that should be in a CSS class (e.g., `.empty-state`).
**Action:** Create a `.empty-state` CSS class and use it for all empty placeholder elements in the play area.

## Summary
The rendering functions work correctly but mix concerns: `bfCardHTML` reads global state, and `renderPlayHand` computes game logic inline. Separating these would improve testability and maintainability.
