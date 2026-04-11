# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `escapeQuotes(card.name)` used in onclick attribute — correct approach
**Severity:** Low (informational)
**Lines:** 2047
`showCardDetail('${escapeQuotes(card.name)}')` correctly uses `escapeQuotes()` to escape the card name for use inside a single-quoted JavaScript string argument within an onclick attribute. This is the appropriate function for this context and matches the pattern used elsewhere in the file.
**Action:** No change needed. This is correctly implemented.

### `card.name` in `alt` attribute correctly escaped with `escapeHtml()`
**Severity:** Low (informational)
**Lines:** 2048
The `alt` attribute value is correctly escaped with `escapeHtml()`.
**Action:** No change needed.

### `card.name` in the text fallback correctly escaped with `escapeHtml()`
**Severity:** Low (informational)
**Lines:** 2049
The card name text fallback inside `.grave-viewer-card-text` is correctly escaped with `escapeHtml()`.
**Action:** No change needed.

### Image URL (`img`) from Scryfall injected into `src` attribute without validation
**Severity:** Low
**Lines:** 2048
`card.image_uris?.normal` is injected directly into an `<img src="...">` attribute. This URL comes from Scryfall API data stored in `playGraveyard`/`playExile`, which were populated from Scryfall at deck load time. There is no validation that the URL is a Scryfall URL.
**Action:** This is an acceptable risk for a family tool using trusted API data. For defence in depth, consider validating that the URL starts with `https://cards.scryfall.io/` before use.

## Summary
Escaping is handled correctly in this section — card names use `escapeQuotes()` in onclick attributes and `escapeHtml()` in HTML content. The only minor note is that Scryfall image URLs are not validated before use.
