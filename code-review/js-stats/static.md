# Static Review — Stats
Lines: 1196–1287 | File: public/mtg-commander.html

## Findings

### `getCardCMC` has a dead branch for `card.card_faces`
**Severity:** Medium
**Lines:** 1199–1200
Both branches of `getCardCMC` return `card.cmc || 0` — the `card.card_faces` check adds no different behaviour. For double-faced cards, Scryfall includes a top-level `cmc` field, so the check is technically correct but the `if` branch is functionally dead.
**Action:** Either remove the `if` branch, or document why the face check exists (perhaps intended for future use of `card_faces[0].mana_cost` parsing).

### `avgCMC` denominator recalculates `nonLandDeck` quantities
**Severity:** Low
**Lines:** 1230
`nonLandDeck.reduce((s,c)=>s+c.qty,0)` is the denominator for `avgCMC`, but this value is already computed earlier as `nonlands` (line 1226). These should be the same value but they are computed independently.
**Action:** Reuse `nonlands` as the denominator: `const avgCMC = nonlands ? (totalCMC / nonlands).toFixed(1) : '0'`.

### `Math.max(...curve, 1)` with spread — safe for 8 elements
**Severity:** Informational
**Lines:** 1243
`Math.max(...curve, 1)` uses spread syntax on an 8-element array. This is safe at this scale (no stack overflow risk).
**Action:** No action needed.

## Summary
The stats calculation logic is mostly correct. Key finding: `getCardCMC` has a dead branch for DFC detection that adds no behaviour. Average CMC denominator is needlessly recalculated.
