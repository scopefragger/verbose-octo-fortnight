# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `changeLife()` bypasses `renderPlayArea()`, creating a parallel DOM-update path
**Severity:** Medium
**Lines:** 1684–1687 (context) vs 1862–1863
`renderPlayArea()` is the canonical function for refreshing all play-area counters. However, `changeLife()` (line 1684) updates the `life-counter` element directly without calling `renderPlayArea()`. This means two different code paths mutate the same DOM element. If a future change moves or renames the element, only one path will be caught.
**Action:** Have `changeLife()` call `renderPlayArea()` instead of directly updating the element, or extract a dedicated `renderCounters()` helper that both paths call.

### `bfCardHTML()` is a pure HTML-generation helper tightly coupled to global play state via `selectedBFId`
**Severity:** Low
**Lines:** 1887
`bfCardHTML()` reaches directly into the global `selectedBFId` variable to compute the CSS class. This makes it impossible to test or reuse `bfCardHTML()` without the global being in the correct state. It also obscures the fact that the function has a hidden side-input.
**Action:** Pass `selectedId` as an explicit parameter: `function bfCardHTML(bfc, selectedId)`. Call sites pass `selectedBFId` explicitly, keeping the function pure.

### `tokenColorClass()` is a standalone helper placed inside the render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass()` is a small utility that maps a color array to a CSS class. It has no dependency on render state and could live in the Utilities section (lines 2141–2156) alongside `escapeHtml()` and `formatManaCostShort()`. Placing it here makes it harder to find when working on token styling.
**Action:** Move `tokenColorClass()` to the Utilities section.

### `renderPlayHand()` partially duplicates the counter-update logic in `renderPlayArea()`
**Severity:** Low
**Lines:** 1907 vs 1867
Discussed in Static review. Architecturally this means `renderPlayHand()` is not a pure render function — it also manages a counter that `renderPlayArea()` owns. The two functions should have clearly distinct responsibilities.
**Action:** `renderPlayHand()` should only render the hand cards. Counter updates should be exclusively owned by `renderPlayArea()` or a dedicated counter-render helper.

## Summary
The main architectural concern is the dual DOM-update path for the life counter — `renderPlayArea()` and `changeLife()` both touch the same element independently. Extracting a shared helper or routing all counter updates through one function would reduce the risk of the two paths diverging. The other findings are minor coupling and placement issues.
