# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### XSS via `manaPool` values rendered into innerHTML
**Severity:** Low
**Lines:** 1628–1631
`manaPool` values are numbers initialized from `{ W:0, U:0, B:0, R:0, G:0, C:0 }` and only ever mutated by arithmetic in `spendMana`/`clearManaPool`. `MANA_COLORS` and `MANA_COLOR_STYLES` are compile-time constants. No external user input flows into these values, so the innerHTML interpolation on lines 1628–1631 is safe in practice.
**Action:** No immediate change required. However, if `manaPool` values ever become externally sourced (e.g. loaded from a saved game state), ensure they are sanitized to integers (e.g. `parseInt(v, 10)`) before use.

### `parseMana` operates on card data from Scryfall API
**Severity:** Low
**Lines:** 1580–1591
`manaCost` strings passed to `parseMana` originate from Scryfall API responses. The regex `\{([^}]+)\}` correctly extracts only brace-delimited tokens and does not produce HTML output, so there is no direct XSS surface. Scryfall is a trusted third-party source, but its data is not validated beyond the regex.
**Action:** No change required for current usage. Document that `parseMana` is safe for display-only use and does not require HTML escaping.

## Summary
No significant security issues. The mana pool render uses innerHTML but with constant and arithmetic-only values. The section does not handle user-originated text strings, so XSS risk is minimal. Ensure future changes that load mana state from persistent storage enforce numeric parsing before use.
