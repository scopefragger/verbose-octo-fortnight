# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Magic number for starting life total
**Severity:** Low
**Lines:** 1554
`let playLife = 40;` uses a bare magic number. Commander format uses 40 starting life, but this should be a named constant for clarity and to support potential format variations.
**Action:** Define `const STARTING_LIFE = 40;` and use it here.

### `MANA_COLOR_STYLES` maps colors to hex strings — no CSS variable counterpart
**Severity:** Low
**Lines:** 1561
The color-to-hex-string mapping in `MANA_COLOR_STYLES` duplicates color theming that could live in CSS variables. If the theme changes, these two systems will diverge.
**Action:** Either reference CSS variables here (e.g. `var(--mana-W)`) or document that this is intentionally a JS-side constant.

### Inline style for the empty mana pool indicator
**Severity:** Low
**Lines:** 1626
The empty-state render uses `style="color:var(--text-dim)"` as an inline style string. Other empty-state placeholders in the file use CSS classes. This is an inconsistency.
**Action:** Use a CSS class for the empty mana pool indicator instead of an inline style.

### `parseMana` result object duplicates `MANA_COLORS` structure manually
**Severity:** Low
**Lines:** 1581
`parseMana` initializes `{ W:0, U:0, B:0, R:0, G:0, C:0, generic:0, X:0 }` by hand rather than building from `MANA_COLORS`. If a color were ever added to `MANA_COLORS`, `parseMana`'s result object would need a separate update.
**Action:** Build the result object from `MANA_COLORS`: `const result = Object.fromEntries(MANA_COLORS.map(c => [c, 0])); result.generic = 0; result.X = 0;`.

## Summary
The play state section has minor pattern inconsistencies: magic numbers for starting life, inline styles mixed with class-based styling, and manual duplication of the `MANA_COLORS` structure in `parseMana`. The mana color style constants are a reasonable JS-side choice but should be documented as intentional.
