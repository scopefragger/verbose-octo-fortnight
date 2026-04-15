# Security Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `escapeQuotes(card.name)` in onclick is insufficient for safe attribute injection
**Severity:** Medium
**Lines:** 2047
The onclick handler is `onclick="showCardDetail('${escapeQuotes(card.name)}')"`. `escapeQuotes` only escapes single quotes (replacing `'` with `\'`). A card name containing a backslash followed by a single quote (e.g. `Test\' Exploit`) could still break out of the string. Additionally, a name containing `</script>` or other HTML special characters could interact with HTML parsing.
For Scryfall API cards this is low risk (card names are well-defined). For token names that are user-supplied (custom tokens added via the modal), this is a real injection vector.
**Action:** Use `JSON.stringify(card.name)` inside the onclick (which produces a properly double-quoted JS string literal): `onclick="showCardDetail(${JSON.stringify(card.name)})"`. This handles all special characters correctly.

### `card.name` rendered via `escapeHtml` in `alt` attribute — correct
**Severity:** Info
**Lines:** 2048
`alt="${escapeHtml(card.name)}"` correctly uses `escapeHtml` for the HTML attribute context. This is the right approach.
**Action:** No change required.

### `card.name` rendered via `escapeHtml` in text fallback — correct
**Severity:** Info
**Lines:** 2049
`${escapeHtml(card.name)}` in the text fallback div is correctly escaped.
**Action:** No change required.

### Image URLs from Scryfall inserted into `src` — low risk
**Severity:** Low
**Lines:** 2046–2049
Image URLs are from Scryfall API responses. In `img src` context, `javascript:` URIs are blocked by browsers. Low risk.
**Action:** No change required.

## Summary
The only security issue is the use of `escapeQuotes` instead of `JSON.stringify` for embedding card names in onclick attribute strings. For Scryfall cards this is low risk, but for user-supplied custom token names it is a real injection vector. All other DOM mutations in this section correctly use `textContent` or `escapeHtml`.
