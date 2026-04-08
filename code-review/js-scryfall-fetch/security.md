# Security Review — Scryfall Fetch
Lines: 1088–1145 | File: public/mtg-commander.html

## Findings

### `encodeURIComponent` correctly used for card name in fuzzy URL
**Severity:** Informational
**Lines:** 1092
`encodeURIComponent(name)` is correctly applied to the card name before including it in the Scryfall URL. No injection risk.
**Action:** No action needed.

### Card names from user input sent to external API
**Severity:** Low
**Lines:** 1111
Card names entered by the user are sent directly to the Scryfall API via `POST /cards/collection`. There is no length limit or character validation before sending. An excessively long or malformed name will result in a Scryfall 422 error (handled poorly — see Static findings).
**Action:** Add a reasonable length guard (e.g. card names > 200 chars are likely invalid) before including in the request body.

### Scryfall API responses stored in `cardCache` without validation
**Severity:** Low
**Lines:** 1117, 1127, 1139
Scryfall card objects are stored in `cardCache` and subsequently used to render HTML. The objects are trusted as-is. If Scryfall were compromised or returned unexpected data, XSS could occur at render time. This is a supply-chain trust concern, not an active risk.
**Action:** Downstream rendering functions must continue to use `esc()` on all card data fields interpolated into HTML.

## Summary
No active XSS or injection risks in this section. `encodeURIComponent` is used correctly. Two low-severity concerns: no input length validation before sending to external API, and card data from Scryfall is trusted without validation (rendering must use `esc()`).
