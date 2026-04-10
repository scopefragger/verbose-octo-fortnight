# Security Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `img` src injected from Scryfall data without sanitisation
**Severity:** Low
**Lines:** 1890, 1918
Image URLs from `bfc.card.image_uris?.small` and `card.image_uris?.normal` are injected directly into `src` attributes without sanitisation. Scryfall is a trusted external source (all URLs are `https://cards.scryfall.io/...`), so in practice this is safe. However, if image data were ever user-supplied or from a different source, this would allow arbitrary URL injection.
**Action:** No immediate action required. Document that `image_uris` values are always from Scryfall API responses and not user-supplied.

### Card name escaping is applied correctly
**Severity:** N/A
**Lines:** 1891, 1892, 1897, 1901, 1917, 1919
`escapeHtml()` is consistently applied to all `card.name` fields before injecting them into `alt` attributes and visible text. This is correct XSS prevention per the codebase pattern.

### Inline `costShort` injected without escaping
**Severity:** Medium
**Lines:** 1920
`costShort` (derived from `formatManaCostShort(card.mana_cost)`) is injected into innerHTML without `escapeHtml()`. `mana_cost` comes from the Scryfall API and is typically a formatted string like `{2}{R}`. If the API were compromised or if `mana_cost` contained unexpected characters (e.g., `<`, `>`), this would be an XSS vector.
**Action:** Wrap `costShort` with `escapeHtml()` before injecting: `${escapeHtml(costShort)}`. Alternatively, `formatManaCostShort` should ensure its output is safe.

## Summary
Card names are correctly escaped, but `costShort` (derived from mana cost data) is injected without escaping. While the Scryfall source is trusted, the pattern is inconsistent and should be corrected for defence-in-depth.
