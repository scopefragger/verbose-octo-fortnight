# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Inline style strings in `renderManaPool()` instead of CSS classes
**Severity:** Low
**Lines:** 1626, 1630
`renderManaPool` builds HTML with inline `style="color:..."` attributes using `MANA_COLOR_STYLES`. Inline styles are harder to theme and override than CSS classes. The `MANA_COLOR_STYLES` map duplicates colour data that could live in CSS variables or class rules.
**Action:** Define CSS classes (e.g. `.mana-pip-W`, `.mana-pip-U`, …) with the colour pre-set, and emit `<span class="mana-pip-${c}">` instead of inline style attributes.

### Magic string `'—'` for empty mana pool display
**Severity:** Low
**Lines:** 1626
The em-dash (`—`) used as the empty-pool placeholder is a magic string embedded directly in the template literal. If the display copy changes it will need to be found by searching HTML-generating strings.
**Action:** Extract to a named constant: `const EMPTY_POOL_GLYPH = '—';`.

### `MANA_COLOR_STYLES` defined at module level but only used in one function
**Severity:** Low
**Lines:** 1561, 1630
`MANA_COLOR_STYLES` is declared as a module-level constant but is only referenced inside `renderManaPool()`. This pollutes the top-level namespace without benefit.
**Action:** Move it inside `renderManaPool()` as a local `const`, or co-locate it with the CSS class approach recommended above.

### `spendMana` generic drain order uses a plain array literal with no comment
**Severity:** Low
**Lines:** 1614
`['C','G','R','B','U','W']` appears as an inline literal with no explanation of why colorless is drained before green, green before red, etc. Future maintainers may assume the order is arbitrary and change it.
**Action:** Extract to a named constant `const GENERIC_DRAIN_ORDER = ['C','G','R','B','U','W'];` and add a brief comment explaining the heuristic.

### `parseMana` result object always includes X and generic keys even when zero
**Severity:** Low
**Lines:** 1581
`parseMana` returns `{ W:0, U:0, B:0, R:0, G:0, C:0, generic:0, X:0 }` with all keys always present. `canAfford` only checks `MANA_COLORS` and `cost.generic`, so `X` is parsed but never acted upon. This creates a misleading API surface — callers may expect `X` costs to be handled.
**Action:** Either consume `result.X` in `canAfford` (e.g. always return `false` if `X > 0` without an explicit amount specified), or document that X costs are intentionally ignored.

## Summary
The section follows consistent coding patterns and is readable. The main pattern issues are cosmetic: inline style strings that would be better as CSS classes, a handful of magic values that should be named constants, and an undocumented `X` key in `parseMana`'s return that is silently ignored by `canAfford`.
