# Security Review — Stats
Lines: 1196–1287 | File: public/mtg-commander.html

## Findings

### `innerHTML` used for mana curve with Scryfall data
**Severity:** Low
**Lines:** 1245–1251
`curveEl.innerHTML = curve.map(...)` generates HTML using `v` (a count integer) and `i` (an index). Both are computed values (not user or API strings), so this is safe as written.
**Action:** No action needed for the current implementation; note that if the data source changes to include strings from Scryfall, escaping must be applied.

### `innerHTML` used for color pips with Scryfall color codes
**Severity:** Medium
**Lines:** 1261–1264
`pipsEl.innerHTML = colorOrder.filter(...).map(c => ...)` injects `c` (color code e.g. `'W'`, `'U'`) from `colorOrder` (a local constant) and `colorCount[c]` (an integer) directly into HTML. These are safe as-is since `colorOrder` is a hard-coded array and counts are integers.
However, the `title` attribute receives `${colorCount[c]} cards` — an integer — which is safe. If `c` were ever sourced from Scryfall data instead of the hard-coded `colorOrder`, it would become an XSS vector.
**Action:** Keep `colorOrder` as a hard-coded constant (not sourced from API data) to maintain safety.

### `innerHTML` for type breakdown uses Scryfall-derived type name
**Severity:** Medium
**Lines:** 1275–1283
`typeEl.innerHTML` interpolates `t` (type name from `getCardType`) and `typeColors[t]` (a color hex string). `getCardType` returns one of 8 hard-coded strings or `'Other'`, never raw Scryfall data. The `typeColors` map returns a hard-coded hex or `'#555'`. Both are safe as written.
**Action:** Maintain the pattern that `getCardType` only returns hard-coded strings to preserve this safety guarantee.

### Inline style `background:${typeColors[t]||'#555'}` is XSS-safe
**Severity:** Informational
**Lines:** 1280
`typeColors[t]` returns hard-coded hex values. The `||'#555'` fallback is a safe default. No injection risk.
**Action:** No action needed.

## Summary
No active XSS in this section. All `innerHTML` interpolations use integers or hard-coded strings. The safety of the color pip and type breakdown rendering depends on `colorOrder` and `getCardType` staying hard-coded — document this constraint.
