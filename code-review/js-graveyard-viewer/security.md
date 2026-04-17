# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `card.name` passed through `escapeQuotes()` into single-quoted `onclick` — partial escaping
**Severity:** High
**Lines:** 2047
The onclick handler is built as:
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` 

`escapeQuotes()` (line 2145–2146) escapes single quotes (`'` → `\'`) and double quotes (`"` → `&quot;`). For a single-quoted JS string argument inside a double-quoted HTML attribute this is correct — single quotes in the card name are escaped as `\'`, preventing them from breaking out of the JS string literal.

However, `escapeQuotes()` does **not** escape backslashes (`\`). A card name containing a backslash (unlikely in MTG but not impossible for custom/token cards in `playGraveyard`) could allow the `\'` escape to be neutralised: `name = "foo\\"` → `escapeQuotes` produces `foo\\'` → the `\'` becomes an escaped backslash followed by an unescaped quote, breaking out of the JS string.

Additionally, graveyard cards can include user-created custom tokens (via `addCustomToken()`, line 1849–1856) whose `name` comes from an `<input>` field. This makes the attack surface real — a user could name a custom token `\` and produce a broken onclick, or with additional characters attempt script injection.
**Action:** Use `escapeHtml()` on the card name and switch to a double-quoted JS string inside the attribute: `onclick="showCardDetail(&quot;${escapeHtml(card.name)}&quot;)"`. Better still, use `data-card-name` attributes and a delegated listener to eliminate inline JS entirely.

### Custom token names from user input reach `innerHTML` via `escapeHtml()` — handled correctly for text
**Severity:** Low
**Lines:** 2048–2049
Card names in the image `alt` attribute and the fallback text div are both wrapped in `escapeHtml()`. This is correct and prevents XSS in those contexts.
**Action:** No action needed for these two — positive finding.

### Scryfall image URLs injected into `src` without validation
**Severity:** Low
**Lines:** 2046–2048
Image URLs from `card.image_uris?.normal` are injected directly into `img src`. Cards in `playGraveyard`/`playExile` arrive from the Scryfall API (trusted HTTPS source) or are constructed locally as token objects (no `image_uris`). Risk is low.
**Action:** No immediate action; document the trust assumption.

### Modal close logic uses raw `getElementById` calls embedded in HTML `onclick` attributes
**Severity:** Low
**Lines:** 1002–1004
The overlay and close-button `onclick` attributes call `document.getElementById('grave-viewer').classList.add('hidden')` inline. While not an injection risk (the element ID is a literal string), this pattern means the element ID is hard-coded in multiple HTML locations, coupling the HTML structure to the JS logic without any escaping layer.
**Action:** Replace with a named `closeGraveViewer()` function call as noted in the Static review.

## Summary
The primary security concern is the use of `escapeQuotes()` on card names injected into single-quoted `onclick` JS arguments — custom token names from user input are in `playGraveyard` and backslash characters are not escaped, creating a potential injection path. The `alt` text and fallback display text are correctly handled with `escapeHtml()`.
