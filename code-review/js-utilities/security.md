# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape double-quotes — unsafe in double-quoted HTML attributes
**Severity:** High
**Lines:** 2143
`escapeHtml(str)` replaces `&`, `<`, and `>` but **not** `"`. When the output is interpolated into an HTML attribute value bounded by double-quotes (e.g., `alt="${escapeHtml(card.name)}"`), a string containing a double-quote could close the attribute prematurely and inject HTML attributes or event handlers.

Example: if `card.name` were `Foo" onload="alert(1)`, the rendered HTML would be:
`alt="Foo" onload="alert(1)"` — which would execute arbitrary JavaScript.

While Scryfall card names don't currently contain double-quotes, the function is used as a general XSS defence throughout the file and should be hardened.
**Action:** Add `"` → `&quot;` to `escapeHtml`:
```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### `escapeQuotes` does not escape backslashes — allows escape sequence injection
**Severity:** High
**Lines:** 2146
`escapeQuotes` backslash-escapes single-quotes (`'` → `\'`) for use in onclick single-quoted JS strings. However, it does **not** escape backslashes. If a card name contains a backslash (e.g., `Foo\' onclick=`), the backslash would escape the backslash that was meant to escape the quote, effectively unescaping it.

Example: card name `Foo\'` → after `escapeQuotes` → `Foo\\'`. In a JS string context this becomes the string `Foo\'`, with the single-quote now unescaped by the remaining backslash. This could break string parsing or allow injection.
**Action:** Escape backslashes **before** escaping quotes:
```js
function escapeQuotes(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}
```
(Remove the `&quot;` replacement — it is the wrong encoding for a JS string context; double-quotes in JS single-quoted strings are literal and harmless.)

### `showToast` sets `el.textContent = msg` — safe, no XSS risk
**Severity:** Low (informational)
**Lines:** 2152
Toast messages are set via `textContent`, which is the correct approach for all caller-supplied strings. No XSS risk here.
**Action:** No change needed.

## Summary
This section contains two high-severity security issues: `escapeHtml` is missing double-quote escaping (creating an XSS risk in attribute contexts), and `escapeQuotes` is missing backslash escaping (creating a potential escape sequence injection risk). Both should be fixed immediately as they underpin the XSS defences used throughout the entire file.
