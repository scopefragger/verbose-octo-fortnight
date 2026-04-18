# Security Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `type_line` injected into innerHTML without escaping
**Severity:** High
**Lines:** 1899
```js
<div class="tok-type">${bfc.card.type_line?.split('—')[1]?.trim() || 'Token'}</div>
```
The type line suffix is extracted from Scryfall API data and injected directly into `innerHTML` without `escapeHtml()`. If a card's `type_line` from Scryfall (or a crafted/cached response) contains HTML characters, they would be rendered. All other card text in this function (`name`, `shortName`) is correctly wrapped in `escapeHtml()`.
**Action:** Wrap the expression: `${escapeHtml(bfc.card.type_line?.split('—')[1]?.trim() || 'Token')}`.

### `costShort` injected into innerHTML without escaping
**Severity:** Medium
**Lines:** 1920
`formatManaCostShort(card.mana_cost)` output is interpolated directly into the innerHTML template. If `formatManaCostShort` produces raw HTML (e.g., mana symbols as `<img>` tags) rather than plain text, this is intentional — but if it produces text, it should be wrapped in `escapeHtml()`. Verify the function's return value.
**Action:** Inspect `formatManaCostShort` (js-utilities section): if it returns plain text, add `escapeHtml()`. If it intentionally returns HTML, document this at the call site with a comment.

### External image URL injected into `src` attribute
**Severity:** Low
**Lines:** 1890, 1913
Card image URLs from Scryfall are injected directly into `src=""` attributes. This is acceptable for a trusted API, but if the card cache is ever populated from an untrusted source or the API is MITM'd, arbitrary URLs could be loaded.
**Action:** No immediate change required, but consider adding a Content Security Policy `img-src` directive that restricts image loading to Scryfall domains.

## Summary
One High-severity XSS risk: `type_line` is injected into innerHTML without `escapeHtml()` — unlike all other card text in this function. The `costShort` injection needs verification. Both are straightforward fixes.
