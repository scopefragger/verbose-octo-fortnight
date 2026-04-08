# Static Review — Hand Simulator
Lines: 1325–1432 | File: public/mtg-commander.html

## Findings

### `mulligan` info text is hardcoded for counts 1 and 2, then formula-based
**Severity:** Low
**Lines:** 1365–1367
The text for mulligan 1 and 2 is hard-coded (`'6-card hand'`, `'5-card hand'`), then falls back to `${7 - mulliganCount}-card hand (mulligan ${mulliganCount})`. The hard-coded cases are redundant — they produce the same result as the formula.
**Action:** Remove the first two `?:` branches and use the formula for all values: `${7 - mulliganCount}-card hand${mulliganCount > 0 ? ` (mulligan ${mulliganCount})` : ''}`.

### `critiqueHand` recalculates deck stats already computed in `updateStats`
**Severity:** Low
**Lines:** 1388–1393
`totalCards`, `lands`, `avgCMC` are recalculated inline. These same values are computed in `updateStats`. There is no shared stats object that could be reused.
**Action:** Consider caching the computed stats after `updateStats()` runs, or extract `computeStats()` as a pure function (as recommended in js-stats architecture review) and call it here.

### `buildDrawPile` fallback `{ name: c.name }` for null card data
**Severity:** Low
**Lines:** 1329
`c.data || { name: c.name }` creates a minimal card object for cards Scryfall didn't find. This minimal object has no `image_uris`, `type_line`, `mana_cost`, etc. Downstream code in `renderHand` and `critiqueHand` accesses these fields with optional chaining or fallbacks, so this is safe — but the fallback card will render as a nameless placeholder.
**Action:** Add a comment: `// fallback for Scryfall misses — minimal object for display`.

### `Math.max(7 - mulliganCount, 1)` — floor of 1 card hand
**Severity:** Low
**Lines:** 1359
The minimum hand size after mulligans is 1 card. In MTG rules, you can mulligan down to 0 (or choose not to). The `Math.max(..., 1)` prevents a 0-card hand simulation.
**Action:** This is a design choice; add a comment: `// minimum 1-card hand — rule simplification`.

## Summary
Hand simulator is functionally correct. Key static findings: mulligan text has redundant hard-coded cases, deck stats are recalculated inline (duplication from updateStats), and the minimum hand size floor is an undocumented design choice.
