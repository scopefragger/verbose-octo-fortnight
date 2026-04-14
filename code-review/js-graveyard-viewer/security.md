# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` used for `card.name` in `onclick` attribute
**Severity:** Medium
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` — `escapeQuotes` escapes single quotes (`'` → `\'`) and double quotes (`"` → `&quot;`). Card names come from Scryfall API data. While Scryfall card names are generally safe strings, they are external API data and technically user-observable (players can name cards). If a card name contained a sequence that breaks out of the escaped context, XSS would be possible.

The `escapeQuotes` function on line 2146 uses `str.replace(/'/g, "\\'")` — this escapes single quotes with a backslash. However in HTML attribute context, backslash-escaped single quotes are not a standard HTML encoding; the HTML attribute value is terminated by the matching unescaped quote character. The correct approach for embedding a string value in a JS function call within an HTML attribute is to JSON-stringify the string and inject the result within double quotes.
**Action:** Replace `'${escapeQuotes(card.name)}'` with `${JSON.stringify(card.name)}` to properly escape card names for inline JS attribute context. This is a medium-severity finding because malformed card names could theoretically break out of the onclick context.

### `grave-viewer-title` is set via `textContent` with emoji literals
**Severity:** Low
**Lines:** 2043
`document.getElementById('grave-viewer-title').textContent = zone === 'graveyard' ? '🪦 Graveyard' : '✨ Exile';` — emoji literals in `textContent` are safe (no HTML parsing occurs). No issue.
**Action:** No action needed.

### `escapeHtml` correctly applied to card names in `alt` attribute and fallback text
**Severity:** Low
**Lines:** 2048–2049
`escapeHtml(card.name)` is correctly used in `alt` attributes and fallback text div. Good practice.
**Action:** No action needed.

## Summary
The primary security concern is the use of `escapeQuotes` for embedding card names in inline `onclick` JS — backslash-escaping single quotes is not reliable in all HTML parsers. JSON.stringify is the correct approach. This is a medium-severity finding because Scryfall names could theoretically contain sequences that escape the onclick context.
