# Patterns Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Hardcoded drain order in `spendMana`
**Severity:** Low
**Lines:** 1614
The generic-mana drain order `['C','G','R','B','U','W']` is a magic array literal with no comment explaining why this order was chosen (e.g. drain colorless first, then colors in reverse WUBRG order). Future maintainers may inadvertently change it.
**Action:** Extract into a named constant `const MANA_DRAIN_ORDER = ['C','G','R','B','U','W'];` with a comment: `// drain colorless first, then non-white colors, white last`.

### Inline style strings for mana colors duplicate potential CSS variables
**Severity:** Low
**Lines:** 1561, 1630
`MANA_COLOR_STYLES` defines color hex values as a JS object used for inline `style` attributes in `renderManaPool`. These colors are not referenced as CSS variables and may diverge from any mana-color styling used in other parts of the file.
**Action:** Define mana colors as CSS custom properties (e.g. `--mana-W`, `--mana-U`) and reference them in JS as `var(--mana-W)` or add a comment confirming these are intentionally JS-side only.

### `parseMana` silently ignores unrecognized mana symbols
**Severity:** Low
**Lines:** 1583–1589
Unrecognized symbols (e.g. `{S}` for snow, `{P}` for Phyrexian) are silently dropped. `{hybrid}` is counted as generic via the `v.includes('/')` check, but `{2/W}` (two-or-one-colored hybrid) is not explicitly handled.
**Action:** Add a comment noting which symbols are intentionally not handled and why. Consider logging unknown symbols during development (`console.debug`) to catch future format changes from Scryfall.

### Missing JSDoc / comments on key functions
**Severity:** Low
**Lines:** 1593, 1606
`canAfford` and `spendMana` have brief inline comments but no function-level documentation describing their preconditions (e.g. "call parseMana first", "mutates global manaPool").
**Action:** Add one-line JSDoc comments to these functions describing their parameters, side effects, and return values.

## Summary
The pattern issues are mostly about hardcoded magic values and missing documentation. The mana drain order and color style constants should be named and commented for maintainability. No serious pattern violations exist.
