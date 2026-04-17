# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `renderPlayHand()` is driven by two separate callers with different purposes
**Severity:** Medium
**Lines:** 1861, 1634
`renderPlayHand()` is called both from `renderPlayArea()` (expected: full re-render after a game event) and from `renderManaPool()` (to refresh affordability indicators after mana changes). This dual-caller pattern means `renderPlayHand()` has two distinct reasons to run, each with different contexts. The side-effect of updating `play-hand-count` at line 1907 is appropriate in the `renderPlayArea()` call path but is spurious when called from `renderManaPool()`.
**Action:** Extract affordability-indicator-only refresh into a separate lightweight function (e.g. `refreshHandAffordability()`), or make `renderPlayHand()` accept a parameter that controls whether the count badge is also updated.

### `bfCardHTML()` is a render helper mixed into the render section but uses global state
**Severity:** Low
**Lines:** 1882–1903
`bfCardHTML()` reads `selectedBFId` (global) directly to compute the `selectedClass`. This couples the HTML generation function to the selection-state variable, meaning the function is not a pure data-to-HTML transformer. Passing `selectedBFId` as a parameter would make the function testable and stateless.
**Action:** Change signature to `bfCardHTML(bfc, selectedId)` and pass `selectedBFId` from the call site in `renderBattlefield()`.

### `tokenColorClass()` is a utility placed inside the render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass()` is a small pure function that maps a colours array to a CSS class name. It has no dependency on render state and would be better placed in the Utilities section alongside `escapeHtml()` and `formatManaCostShort()`.
**Action:** Move `tokenColorClass()` to the Utilities section (around line 2141).

### `renderPlayArea()` re-renders everything on every game event
**Severity:** Low
**Lines:** 1859–1868
Every game action (draw, tap, play card, etc.) calls `renderPlayArea()` which re-renders both the full battlefield and the full hand. For the current card counts in Commander (up to ~100 cards) this is acceptable, but the pattern offers no granularity — a single counter change triggers a full DOM replacement.
**Action:** This is an intentional simplicity trade-off for a single-file app. Document it with a comment (e.g. `// Full re-render on each action — acceptable for Commander hand/board sizes`).

## Summary
The section is a clean collection of HTML-generation functions. The main architectural issue is `renderPlayHand()` being driven from two contexts (full render and mana-affordability refresh) with a side-effect that is only appropriate in one of them. Passing `selectedBFId` as a parameter to `bfCardHTML()` would also improve testability.
