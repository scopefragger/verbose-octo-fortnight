# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `card.name` passed to `showCardDetail` via `escapeQuotes` in onclick attribute
**Severity:** Medium
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` — `escapeQuotes` escapes `'` and `"` but does not prevent all HTML attribute injection. A card name containing `</div><script>` would be HTML-entity-escaped by the browser's attribute parsing, but a name containing a sequence like `\');alert(1)//` (backslash followed by closing paren) could break the intended escaping. While standard MTG card names from Scryfall do not contain such characters, custom tokens or user-entered card names could.
**Action:** Replace the inline onclick with a `data-name` attribute and attach a click listener in JS, or pass the array index and look up the name in the handler.

### `grave-viewer-title` set via `textContent` — safe
**Severity:** Low
**Lines:** 2043
`document.getElementById('grave-viewer-title').textContent = ...` uses `textContent`, which prevents HTML injection from the zone string.
**Action:** No change needed.

### Image `src` from Scryfall data — same concern as other segments
**Severity:** Low
**Lines:** 2046
Scryfall image URLs are used directly as `src` attributes. See the render-play-area security review for details.
**Action:** Validate URLs start with `https://` if extra caution is desired.

## Summary
The `escapeQuotes` approach for passing card names through onclick attributes is insufficient for full XSS prevention. Using data attributes with JS event listeners would be the correct fix, especially if custom tokens with user-controlled names are ever allowed.
