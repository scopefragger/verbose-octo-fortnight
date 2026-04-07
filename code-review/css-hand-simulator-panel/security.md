# Security Review — Hand Simulator Panel
Lines: 345–417 | File: public/mtg-commander.html

## Findings

### Potential XSS via `escapeQuotes` in `onclick` Attribute (renderHand)
**Severity:** High
**Lines:** 1424 (renderHand, referenced by this panel's CSS)
`renderHand()` builds `.hand-card` elements using `innerHTML` and embeds card names directly into an `onclick` attribute string via `escapeQuotes()`:
```js
onclick="showCardDetail('${escapeQuotes(card.name)}')"
```
`escapeQuotes` escapes single quotes but does not HTML-encode the value. A card name containing `</div><img onerror=alert(1) src=x>` or similar HTML metacharacters would break out of the attribute and inject arbitrary HTML into the DOM. Card data originates from Scryfall (trusted third party) and is cached locally, but any future data source or cache-poisoning scenario makes this exploitable.
**Action:** Use `escapeHtml()` (already present in utilities) on the card name when embedding it in `onclick`, or — better — switch to `document.createElement` + `addEventListener` so no serialisation into HTML strings is needed.

### `textContent` Used Correctly for Critique Output
**Severity:** Low (informational)
**Lines:** 1407, 1409
`textEl.textContent = json.critique` correctly uses `textContent` rather than `innerHTML` for API-returned text, preventing XSS from the Groq response. This is good practice and should be maintained.
**Action:** No change needed; note this pattern should be preserved if the critique display is ever enhanced (e.g., markdown rendering would require sanitisation).

## Summary
The most significant security concern is the use of `escapeQuotes` instead of proper HTML-attribute encoding when card names are interpolated into `onclick` strings inside `innerHTML`. The critique output box is safe thanks to `textContent` usage. Migrating `renderHand` to DOM APIs would eliminate the injection risk entirely.
