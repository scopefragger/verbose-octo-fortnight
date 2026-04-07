# Security Review — Card Detail Modal
Lines: 419–468 | File: public/mtg-commander.html

## Findings

### Oracle text and card fields rendered via textContent — no XSS risk
**Severity:** Low (informational)
**Lines:** 1441–1444 (JS consumer of these CSS classes)
All dynamic Scryfall data (`card.name`, `card.mana_cost`, `card.type_line`, `card.oracle_text`) is inserted using `.textContent`, not `innerHTML`. This correctly prevents XSS even if Scryfall returns unexpected markup. The image `src` is set directly from the API response; because it is an attribute assignment (not innerHTML), this is safe for `http`/`https` URLs, but a malformed or `javascript:` URI in `image_uris.normal` could theoretically be set. Scryfall is a trusted CDN so the practical risk is negligible, but there is no explicit URL validation.
**Action:** No immediate action required; optionally add a guard that checks `imgUrl.startsWith('https://')` before assigning to `src` for defense-in-depth.

## Summary
The CSS segment itself introduces no security surface. The associated JavaScript correctly uses `textContent` for all text insertions, and the only marginally interesting vector (image `src` assignment) is low risk given the trusted data source. No actionable security issues.
