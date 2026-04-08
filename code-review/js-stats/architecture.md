# Architecture Review — Stats
Lines: 1196–1287 | File: public/mtg-commander.html

## Findings

### `updateStats` is renamed `renderStats` in section description but `updateStats` in code
**Severity:** Medium
**Lines:** 1221
SEGMENTS.MD and `importDecklist()` call `updateStats()`, but the section description uses `renderStats()`. The actual function in code is `updateStats`. This inconsistency makes it harder to navigate the file.
**Action:** Standardise: rename to `renderStats` to follow the `render*` convention used by `renderDeckList`, `renderHand`, `renderPlayArea`, etc.

### `updateStats` mixes data computation with DOM rendering
**Severity:** Medium
**Lines:** 1221–1287
The function computes CMC averages, curve data, color counts, and type counts — then immediately renders all of them to the DOM. Separating `computeStats(deck)` → pure data from `renderStats(stats)` → DOM update would make the computation testable.
**Action:** Consider extracting `computeStats(deck)` as a pure function returning `{ totalCards, lands, nonlands, avgCMC, curve, colorCount, typeCount }` and having `updateStats` call it then render.

### Hard-coded type colour map embedded in render function
**Severity:** Low
**Lines:** 1268
`typeColors` is a large object literal defined inside `updateStats`. It is a configuration constant that should live outside the function at module scope.
**Action:** Extract `typeColors` to a `const` at the top of the stats section.

## Summary
The stats section correctly separates helper functions (`getCardCMC`, `getCardColors`, `getCardType`) from the main render. Key improvements: rename `updateStats` to `renderStats`, separate computation from rendering, and extract `typeColors` to module scope.
