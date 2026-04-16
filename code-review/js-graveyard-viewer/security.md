# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` is the wrong escaping function for an HTML `onclick` attribute context
**Severity:** High
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` uses `escapeQuotes`, which escapes single quotes as `\'` and double quotes as `&quot;`. However, the outer attribute delimiter is a double quote (`onclick="..."`), so the critical character to escape is `"`, not `'`.

`escapeQuotes` escapes `'` as `\'` — a backslash-escape that is valid JavaScript but is **not** a valid HTML entity, meaning the HTML parser may misinterpret it. More critically, `escapeQuotes` does **not** escape `<` or `>`, so a card name like `Lim-Dul's Vault` is handled, but a hypothetical name containing `</div onclick="` could break out of the attribute.

Since card names come from Scryfall API data stored in the deck, this represents a genuine XSS risk if malicious data is ever stored in a deck's card list.
**Action:** Replace the `onclick` inline string approach with a `data-` attribute and an `addEventListener` delegation pattern. If inline onclick must be kept, use `escapeHtml(JSON.stringify(card.name))` to produce a safely quoted JS string: `onclick="showCardDetail(${escapeHtml(JSON.stringify(card.name))})"`.

### `img` URL from Scryfall API inserted directly into `src` attribute without validation
**Severity:** Low
**Lines:** 2046, 2048
`card.image_uris?.normal` (a Scryfall CDN URL) is placed directly into `<img src="${img}">` without sanitisation. While Scryfall URLs are trusted, if deck data is ever loaded from an untrusted source, an attacker could inject a `javascript:` URL here.
**Action:** Add a URL scheme check before using image URLs: `const safeImg = img && img.startsWith('https://') ? img : '';`. Use `safeImg` in the template and only render the `<img>` element when `safeImg` is non-empty.

### `escapeHtml(card.name)` in `alt` attribute — correct and safe
**Severity:** Low
**Lines:** 2048
The `alt` attribute correctly uses `escapeHtml`, preventing HTML injection from card names in that context.
**Action:** No action required; this is a positive pattern to preserve.

### Empty state HTML uses inline style — no injection risk
**Severity:** Low
**Lines:** 2052
The empty-state div has a hardcoded inline style and static text — no user data is interpolated here.
**Action:** No action required.

## Summary
The primary security concern is the use of `escapeQuotes` in the `onclick` attribute context: it escapes the wrong characters for HTML attribute quoting and does not protect against all injection vectors. The `img` URL should also be validated to be a safe `https://` URL. The `alt` attribute is correctly escaped.
