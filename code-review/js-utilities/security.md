# Security Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is used in HTML attribute contexts but doesn't escape `"`
**Severity:** High
**Lines:** 2142–2144 (definition), used at 1891, 1892, 1897, 1901, 1920, 2048, 2049, 2120, 2121, etc.
`escapeHtml` escapes `&`, `<`, `>` but not `"`. It is used in double-quote-delimited HTML attributes:
```html
alt="${escapeHtml(card.name)}"
title="${escapeHtml(card.name)}"
```
If a card name from an API response contained a `"` character, the attribute would terminate early and any subsequent text before the next `"` would be interpreted as HTML attributes or event handlers — a potential XSS vector in attribute injection form.

Scryfall card names currently do not contain double quotes, so this is a latent rather than exploitable risk today. However, the function's incomplete escaping creates systemic false confidence: any future call site that trusts `escapeHtml` in an attribute context is silently vulnerable.
**Action:** Add `"` → `&quot;` to `escapeHtml`:
```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

### `escapeQuotes` mixes JS-escape and HTML-entity encoding
**Severity:** Low
**Lines:** 2145–2147
```js
function escapeQuotes(str) {
  return String(str).replace(/'/g,"\\'").replace(/"/g,'&quot;');
}
```
This function applies two different encoding layers simultaneously: `\'` (JS string escape) and `&quot;` (HTML entity). It works correctly for the single-quoted JS argument in a double-quote-delimited HTML attribute (`onclick="func('${escapeQuotes(name)}')"`) but is misleading — a reader might apply it in a context where both encodings are not appropriate (e.g., inside a JS template literal string, where `&quot;` would not be decoded).
**Action:** Add a comment documenting the expected usage context: `// For embedding strings as single-quoted JS arguments inside HTML attribute values only`.

## Summary
One High-severity systemic issue: `escapeHtml` does not escape `"`, making every use in a double-quote-delimited HTML attribute a latent XSS vector. Adding `.replace(/"/g,'&quot;')` is a one-line fix that closes the vulnerability across all call sites simultaneously.
