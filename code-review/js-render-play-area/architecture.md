# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` is a pure HTML-generation function but accesses `selectedBFId` global state
**Severity:** Medium
**Lines:** 1882–1903
`bfCardHTML(bfc)` is a card-to-HTML transformer but reads the global `selectedBFId` to apply the `.selected` class. This means the function has a hidden dependency on global state and cannot be tested or reasoned about in isolation. Any other code that changes `selectedBFId` will implicitly affect the output of `bfCardHTML`.
**Action:** Pass `selectedBFId` as a parameter: `bfCardHTML(bfc, selectedId)`.

### `renderPlayHand` mixes layout rendering with affordability logic
**Severity:** Low
**Lines:** 1905–1922
`renderPlayHand()` calls `canAfford(card.mana_cost)` and `getCardType(card)` to compute affordability indicators inline within the render loop. This couples the render function to the mana system and card classification system. A pre-computed `isAffordable` property on the hand card (or a separate mapping step) would make the render function a pure template.
**Action:** Consider pre-computing affordability before the render loop and passing it to a card template function.

### Empty-state HTML uses inline styles throughout
**Severity:** Low
**Lines:** 1873–1874, 1909
All empty-state placeholder divs use `style="color:var(--text-dim);font-size:..."` inline rather than a shared CSS class. This creates multiple copies of the same inline style that must be updated in sync.
**Action:** Define a `.empty-state-hint` CSS class and use it for all empty-state placeholders.

## Summary
The render section is structurally sound but `bfCardHTML` has a hidden dependency on global `selectedBFId` state, making it a non-pure render function. The hand render mixes affordability computation with DOM generation. Empty-state placeholder styles are duplicated as inline strings rather than a shared CSS class.
