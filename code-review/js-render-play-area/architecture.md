# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` mixes token-rendering and card-rendering responsibilities
**Severity:** Medium
**Lines:** 1882–1903
`bfCardHTML()` handles two visually and structurally distinct cases — image cards and token cards — in a single function with an `if/else` branch. As the token rendering grows (power/toughness, type line, colour class), this becomes harder to maintain.
**Action:** Consider splitting into `bfImageCardHTML()` and `bfTokenCardHTML()` helpers, with `bfCardHTML()` acting as a dispatcher. This also makes it easier to test each rendering path independently.

### `tokenColorClass` is a utility but placed inside render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass()` is a pure helper that could reasonably live near other token-related utilities (e.g., near the Utilities section at lines 2141–2156). Its placement here is not wrong but is slightly inconsistent.
**Action:** Move to the utilities section or at minimum add a comment noting it is a rendering helper.

### `renderPlayHand` duplicates `play-hand-count` update already done by `renderPlayArea`
**Severity:** Low
**Lines:** 1907 (vs 1867)
`renderPlayHand()` updates `play-hand-count` independently, making it callable standalone but creating redundancy when called via `renderPlayArea()`. This is a minor coupling issue — callers must know about this side effect.
**Action:** Either centralise all counter updates in `renderPlayArea()` and remove the update from `renderPlayHand()`, or document that `renderPlayHand()` is designed to be callable standalone.

### Inline "Empty" placeholder HTML is duplicated
**Severity:** Low
**Lines:** 1873–1874
Both battlefield zones use a hard-coded inline-styled `<div>` for their empty states. This pattern is repeated and should be extracted to a shared helper or CSS class.
**Action:** Create an `emptyPlaceholder(label)` helper function or a `.zone-empty` CSS class to centralise this pattern.

## Summary
The section is tightly scoped to rendering and reads clearly. The main architectural concern is `bfCardHTML` conflating two distinct card types. Extracting token rendering to a separate function and centralising the "empty zone" placeholder would significantly improve maintainability.
