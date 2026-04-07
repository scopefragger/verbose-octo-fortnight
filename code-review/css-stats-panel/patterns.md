# Code & Pattern Review — Stats Panel
Lines: 280–344 | File: public/mtg-commander.html

## Findings

### Magic numbers throughout mana curve and type bar rendering
**Severity:** Low
**Lines:** 1248, 1280
`56`, `2`, and `100` (percent) are embedded as bare literals in the bar-height and bar-width calculations with no named constants or comments explaining their derivation. The `8` in `Array(8).fill(0)` (line 1238) represents CMC buckets 0–7 but is also unexplained.
**Action:** Extract named constants — e.g., `CURVE_MAX_CMC = 7`, `CURVE_DRAW_HEIGHT_PX = 56`, `CURVE_MIN_HEIGHT_PX = 2` — either at module scope or as local `const` declarations inside `updateStats`.

### Inline `style` attributes duplicate what CSS classes could express
**Severity:** Low
**Lines:** 1248, 1263–1264, 1280
Bar heights and background colors are all applied via inline `style` attributes generated in JS template literals. The mana curve bars already have a `.curve-bar` class with a `transition: height 0.4s ease` rule, so the height attribute is unavoidably inline — but the `background` color for type bars could be handled by a set of CSS classes (`.type-bar-land`, `.type-bar-creature`, etc.) matching the `typeColors` map, keeping color decisions in CSS.
**Action:** Consider replacing `typeColors` inline backgrounds with per-type CSS classes for easier theming and to keep visual concerns in the stylesheet.

### Fallback "Colorless" label uses an inline style instead of a class
**Severity:** Low
**Lines:** 1264
`'<span style="color:var(--text-dim);font-size:0.75rem">Colorless</span>'` — this is the only place in the stats rendering that uses a raw inline style rather than a utility or component class. The rest of the UI uses CSS classes consistently.
**Action:** Add a `.colorless-label` class (or reuse `.curve-label` / `.type-name`) and replace the inline style.

### `avgCMC` is a string from `.toFixed(1)` but treated as a display value directly
**Severity:** Low
**Lines:** 1230, 1233
`avgCMC` is assigned either the string result of `.toFixed(1)` or the string `'0'`. This is fine for display, but the variable name and type are inconsistent — callers reading the code expect a number. If `avgCMC` were ever used in further arithmetic (e.g., a future comparison or export), the string type would be a silent bug.
**Action:** Keep the numeric value separate (`const avgCMCNum = ...`) and only stringify at the point of `textContent` assignment.

### `pip-C` class defined in CSS but colorless cards are never rendered as pips
**Severity:** Low
**Lines:** 334, 1261–1264
The CSS defines `.pip-C` (colorless pip styling) but `colorOrder` only contains `['W','U','B','R','G']`. Colorless cards (`C` in `color_identity`) are silently excluded from pip rendering and fall through to the "Colorless" text fallback. The CSS class is dead code in the current implementation.
**Action:** Either add `'C'` to `colorOrder` so colorless identity is represented with its pip, or remove the `.pip-C` CSS rule if colorless pips are intentionally not shown.

## Summary
The CSS for the stats panel is well-structured and consistent with the rest of the component. The primary pattern issues are in the companion JS: magic pixel/percent constants, a handful of inline styles that belong in the stylesheet, and a dead `.pip-C` CSS class that is never exercised by the rendering logic.
