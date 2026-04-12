# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline `onclick` handler built with `escapeQuotes` — backslash-escape is fragile
**Severity:** Medium
**Lines:** 2047
The card name is embedded into an inline `onclick` attribute as a JS string argument:
```js
onclick="showCardDetail('${escapeQuotes(card.name)}')"
```
`escapeQuotes` escapes single quotes with `\'` and double quotes with `&quot;`. However, this approach relies on the assumption that no other character sequence can break the string context. A card name containing a backtick, a `</script>` sequence, or HTML-entity-decoded content after the browser parses the attribute could still create unexpected execution paths. The CLAUDE.md project guideline notes: *"IDs passed as JS string arguments must be `esc()`-wrapped"* — card names should be treated similarly with a stricter encode-to-data-attribute approach.
**Action:** Store the card name in a `data-name` attribute and attach the click handler programmatically (or via event delegation), completely eliminating the inline-onclick string-interpolation risk:
```html
<div class="grave-viewer-card" data-card-name="${escapeHtml(card.name)}">
```
```js
document.getElementById('grave-viewer-cards').addEventListener('click', e => {
  const el = e.target.closest('.grave-viewer-card');
  if (el) showCardDetail(el.dataset.cardName);
});
```

### Image URL from external API embedded without sanitisation
**Severity:** Low
**Lines:** 2048
`card.image_uris?.normal` originates from the Scryfall API (a trusted third-party). Although Scryfall is considered safe, the URL is embedded into `innerHTML` without passing through `escapeHtml()`. If the Scryfall response is ever intercepted or the data is cached with tampered content, a malicious URL value could break attribute quoting.
**Action:** Wrap with `escapeHtml(img)` before embedding in the template literal.

### Card names from stored state are re-rendered without re-validation
**Severity:** Low
**Lines:** 2042, 2047, 2049
`playGraveyard` and `playExile` are module-level arrays populated from Scryfall API responses. If those arrays were ever poisoned (e.g., via a tampered local-storage restore or a future persistence feature), card names would render unescaped in `onclick`. Currently `escapeQuotes` and `escapeHtml` provide some protection, but the inline-onclick pattern is inherently weaker than data-attribute delegation (see first finding).
**Action:** Address by implementing the event-delegation pattern noted above.

## Summary
The most significant security concern is the inline `onclick` string interpolation of card names. While `escapeQuotes` provides partial mitigation, the project's own XSS guidance recommends a stricter approach for onclick attributes. Switching to data-attribute + event delegation would eliminate this risk class entirely.
