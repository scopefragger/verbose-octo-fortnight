# Patterns Review — Stats
Lines: 1196–1287 | File: public/mtg-commander.html

## Findings

### Magic numbers: curve size `8`, bar height `56`, bar minimum `2`
**Severity:** Low
**Lines:** 1238, 1248
`Array(8).fill(0)` (max CMC bucket 7+), `Math.min(..., 7)`, bar height formula `Math.round((v/maxVal)*56)+2` all contain inline magic numbers.
**Action:** Extract `const MAX_CMC_BUCKET = 7`, `const CURVE_MAX_HEIGHT_PX = 56`, `const CURVE_MIN_HEIGHT_PX = 2`.

### Hard-coded color order `['W','U','B','R','G']` and `colorMap` unused
**Severity:** Low
**Lines:** 1258, 1260
`colorMap` is defined on line 1258 (`{ W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' }`) but never used — `colorOrder` on line 1260 duplicates the same values. `colorMap` is dead code.
**Action:** Remove `colorMap`.

### Inline style on stats visibility (`style.display`)
**Severity:** Low
**Lines:** 1285–1286
`style.display = 'none'` and `style.display = ''` are used here; the `hidden` CSS class is used elsewhere in the file. Consistency issue noted in js-import review as well.
**Action:** Standardise on `classList.toggle('hidden', ...)`.

### `colorCount` built on entire `deck` including lands
**Severity:** Low
**Lines:** 1255–1257
Color count includes lands, which may inflate green/white counts for land-heavy decks that run basics. Other sections use `nonLandDeck` for computations. Whether to include lands is a design choice but should be documented.
**Action:** Add a comment: `// includes lands — intentional for color identity display`.

## Summary
Stats has several patterns issues: dead `colorMap` variable, magic numbers for curve bar heights, mixed visibility strategies, and undocumented inclusion of lands in color counting.
