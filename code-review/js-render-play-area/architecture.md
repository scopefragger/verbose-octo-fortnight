# Architecture Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` reads global `selectedBFId`
**Severity:** Medium
**Lines:** 1887
`bfCardHTML(bfc)` is a pure-looking mapping function (card → HTML string) but reads the global `selectedBFId` to determine the `selected` CSS class. This means the function's output varies with external state, making it non-deterministic from the perspective of a caller passing only the card object.
**Action:** Pass `selectedBFId` as a second parameter: `bfCardHTML(bfc, selectedBFId)`. This makes the dependency explicit and allows the function to be called without side-effect concerns.

### `renderPlayHand` called from both this section and `renderManaPool`
**Severity:** Low
**Lines:** 1905 (definition), called from 1634 and 1861
`renderPlayHand` has two callers in different sections: `renderManaPool` (play-state) and `renderPlayArea` (this section). The play-state section calling a render function from a later section creates an implicit ordering dependency that is fragile and non-obvious.
**Action:** In `renderManaPool`, instead of calling `renderPlayHand()`, call a lighter `updateHandAffordability()` function that only updates the affordability indicators (CSS classes) rather than rebuilding the entire hand DOM.

## Summary
The section's main architecture issue is `bfCardHTML` silently reading global state (`selectedBFId`). Making this an explicit parameter would improve clarity and testability.
