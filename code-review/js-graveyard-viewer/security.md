# Security Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `card.name` in onclick uses `escapeQuotes` — acceptable but inconsistent
**Severity:** Low
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` uses `escapeQuotes()` to escape the card name before embedding it in a single-quoted JavaScript string argument in an onclick attribute. This correctly prevents a card name containing a single quote from breaking out of the string. However, the card name could contain other characters that might cause issues in an HTML attribute context (e.g., `>`). Using `escapeHtml()` additionally would be more defensive.
**Action:** Consider using both: `escapeHtml(escapeQuotes(card.name))`, or better, use an index/ID-based approach to avoid embedding strings in onclick attributes entirely.

### `card.name` in `alt` attribute correctly escaped
**Severity:** N/A
**Lines:** 2048
`alt="${escapeHtml(card.name)}"` correctly applies `escapeHtml()` for the alt attribute. This is the right pattern.

### Image URL from Scryfall injected into `src` without sanitisation
**Severity:** Low
**Lines:** 2046, 2048
Same as noted in `js-render-play-area`: image URLs from Scryfall are trusted but not sanitised. This is acceptable as long as the source remains the Scryfall API.

## Summary
Security is mostly handled correctly. The `escapeQuotes` usage in onclick is adequate but could be strengthened with `escapeHtml` wrapping as well. No critical XSS risks given that card data originates from the trusted Scryfall API.
