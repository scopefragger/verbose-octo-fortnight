# Architecture Review — Stats Panel
Lines: 280–344 | File: public/mtg-commander.html

## Findings

### Stats computation and DOM mutation are fused in one function
**Severity:** Medium
**Lines:** 1221–1286 (`updateStats`)
`updateStats` computes totals, builds the mana curve array, aggregates color counts, and aggregates type counts — all while simultaneously writing to the DOM in the same function body. This makes the aggregation logic untestable in isolation and means any future consumer (e.g., an AI critique endpoint, an export feature) that needs the same numbers must re-derive them or call `updateStats` and side-effect the DOM.
**Action:** Extract pure data functions (`computeDeckStats(deck)`) that return a plain object `{ totalCards, avgCMC, lands, nonlands, curve, colorCount, typeCount }`, then have a thin `renderStats(stats)` function write to the DOM. This also makes unit testing the math trivial.

### Hard-coded type priority list duplicated across two functions
**Severity:** Low
**Lines:** 1211–1218 (`getCardType`), 1268 (`typeColors` keys)
The canonical card type order is implied by the `if/else` chain in `getCardType` and restated by the key order in `typeColors`. A new type added to one place must be manually added to the other.
**Action:** Define a single `TYPE_ORDER` or `TYPE_CONFIG` array/object that drives both the classification priority and the color mapping.

### CSS pixel constants are coupled to JS arithmetic without documentation
**Severity:** Low
**Lines:** 309 (CSS `height: 70px`), 1248 (JS `56 + 2 px`)
The mana curve bar height is computed as `(v/maxVal)*56 + 2` in JS, but the containing element is styled `height: 70px` in CSS. The 56 and 2 are chosen to fit within the 70px after accounting for the `.curve-count` and `.curve-label` elements above/below the bar, but this contract is implicit and spread across two languages.
**Action:** Either compute bar height from the element's `clientHeight` at render time, or document the arithmetic in a comment next to both the CSS rule and the JS constant.

### `getCardColors` silently falls back between two different Scryfall fields
**Severity:** Low
**Lines:** 1203–1206
`card.colors || card.color_identity` — `colors` reflects the card's own color, while `color_identity` includes colors in mana symbols in rules text (e.g., activated abilities). Mixing these silently changes which cards appear in the color pips. The function should consistently use one field depending on what the stats panel is meant to show.
**Action:** Pick one field (likely `color_identity` for Commander deck analysis) and use it exclusively, or document why the fallback is intentional.

## Summary
The main architectural concern is that `updateStats` conflates data aggregation with DOM rendering, making the logic tightly coupled to the HTML structure and difficult to reuse or test. Separating computation from rendering and centralizing the type configuration would significantly improve maintainability.
