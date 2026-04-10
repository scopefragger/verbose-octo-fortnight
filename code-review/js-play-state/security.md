# Security Review — js-play-state
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### Mana color styles injected directly into innerHTML
**Severity:** Low
**Lines:** 1630
`renderManaPool()` injects `MANA_COLOR_STYLES[c]` into an inline style attribute via template literal. These values are hardcoded in the `MANA_COLOR_STYLES` constant, so there is no user-controlled data involved. However, if the constant were ever made configurable or derived from external data, this would become an XSS vector.
**Action:** No immediate action required, but document that `MANA_COLOR_STYLES` must remain a static constant to maintain security.

### Mana cost strings parsed from card data — no sanitisation
**Severity:** Low
**Lines:** 1583–1590
`parseMana()` processes `manaCost` strings that originate from Scryfall API data. The regex `\{([^}]+)\}` is used to extract pip values. While the Scryfall API is trusted, the parsed values are used only in arithmetic and comparisons, not injected into HTML, so there is no XSS risk here.
**Action:** No action required; confirms data is safe.

## Summary
No significant security issues. The one area to watch is that `MANA_COLOR_STYLES` values are used in inline styles — this is safe as long as they remain hardcoded constants.
