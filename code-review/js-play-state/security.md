# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool` interpolates `MANA_COLOR_STYLES` values into inline `style` attributes
**Severity:** Low
**Lines:** 1630
The `style="color:${MANA_COLOR_STYLES[c]};..."` interpolation is safe in practice because `MANA_COLOR_STYLES` is a hard-coded constant object. However, if `MANA_COLOR_STYLES` is ever made configurable or merged with external data, the color values would be injected into a style attribute without sanitisation, enabling CSS injection (data exfiltration via `url()`, `expression()` in older IE, etc.).
**Action:** No immediate change required given values are static constants. Add a code comment marking `MANA_COLOR_STYLES` as trusted-constant-only to prevent future contributors from inadvertently binding it to user data.

### Mana cost strings originate from Scryfall API data
**Severity:** Low
**Lines:** 1580–1591 (`parseMana`), 1593–1604 (`canAfford`), 1606–1621 (`spendMana`)
`manaCost` is passed from card objects fetched from Scryfall. The regex `\{([^}]+)\}` in `parseMana` processes this value. The output is only used for numeric arithmetic and array lookups — it is never written to the DOM — so there is no XSS risk here. However, a malformed or adversarially crafted `manaCost` string could cause unexpected numeric behaviour (e.g. extremely large generic costs).
**Action:** No immediate action required. If card data is ever loaded from untrusted sources (not just Scryfall), add a length/character-set validation on `manaCost` before parsing.

### `getLandMana` reads `card.produced_mana` from Scryfall API data
**Severity:** Low
**Lines:** 1565–1567
The `produced_mana` values are iterated and used as keys in a plain object (`result[c]`). Scryfall returns single-character mana symbols, so this is safe. However, if a value such as `__proto__` were ever present, it would pollute the prototype. This is a theoretical risk given the trusted source.
**Action:** Add a guard: only accept keys that are in `MANA_COLORS` when building the result object (i.e. `if (MANA_COLORS.includes(c)) result[c] = (result[c] || 0) + 1;`).

## Summary
No high-severity security issues. All mana values are used in arithmetic rather than DOM injection, which eliminates XSS risk in this section. The main concern is prototype pollution in `getLandMana` from unvalidated API keys, which is low risk given Scryfall as the trusted source but worth a one-line guard.
