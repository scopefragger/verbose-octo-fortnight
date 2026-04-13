# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` is a pure render function but relies on external state `selectedBFId`
**Severity:** Medium
**Lines:** 1882–1903
`bfCardHTML(bfc)` looks like a pure render helper but reads the module-level `selectedBFId` variable to determine the `selected` CSS class. This means calling `bfCardHTML` has an implicit dependency on global state, making it difficult to test or reuse in other contexts.
**Action:** Pass `selectedBFId` as an argument: `bfCardHTML(bfc, selectedBFId)` so the function is truly pure.

### `renderPlayHand` is called both directly and via `renderPlayArea`
**Severity:** Low
**Lines:** 1859–1868, 1905–1922
`renderPlayArea` calls `renderPlayHand` internally, but `renderPlayHand` is also called externally from `renderManaPool`. This creates multiple call paths to the same DOM updates. If `renderPlayArea` is called, it renders the hand; if `renderManaPool` is called, it renders only the hand. The asymmetry makes it unclear which function should be used in a given context.
**Action:** Document which entry points trigger which renders, or create a single `renderAll()` that is always called after state changes.

### `tokenColorClass` is a utility function placed in the render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass` is a small pure utility function defined among render functions. It would be better placed in the utilities section for easier discovery.
**Action:** Move `tokenColorClass` to the utilities/constants section.

## Summary
The main architectural issue is `bfCardHTML` having a hidden dependency on `selectedBFId` global state. Passing it as a parameter would make the function properly pure. The call-path asymmetry between `renderPlayArea` and the externally called `renderPlayHand` also needs clarification.
