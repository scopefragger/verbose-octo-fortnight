# Security Review — Graveyard Viewer Modal
Lines: 1001–1010 | File: public/mtg-commander.html

## Findings

### XSS vulnerability in onclick attribute with card names
**Severity:** High
**Lines:** 1004
The close button onclick hardcodes `document.getElementById('grave-viewer').classList.add('hidden')` which is safe, but the vulnerability exists downstream in the function that populates this modal. At line 2047, the code uses:
```js
onclick="showCardDetail('${escapeQuotes(card.name)}')"
```
This is properly escaped with `escapeQuotes()` to prevent quote-based injection in the onclick context. However, this relies on the escape function being called correctly every time the modal is populated.

**Action:** The current approach (escaping in the template) is correct. Ensure that `showCardDetail()` calls continue to escape the card name. Consider documenting that all onclick handlers in this modal must use `escapeQuotes()`.

### No sensitive data exposure in this segment
**Severity:** None
The HTML segment itself (lines 1001–1010) contains no API keys, tokens, or sensitive data. All sensitive operations occur downstream in `showGraveViewer()`.

**Action:** No action required for this segment. Continue monitoring the `showGraveViewer()` function to ensure card data from external APIs is not logged to console.

## Summary
The HTML segment itself is secure; no XSS or injection risks in lines 1001–1010. Security depends on proper escaping in downstream functions like `showGraveViewer()`, which correctly uses `escapeQuotes()` and `escapeHtml()`.
