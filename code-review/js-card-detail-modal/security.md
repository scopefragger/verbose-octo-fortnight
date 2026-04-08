# Security Review — Card Detail Modal
Lines: 1434–1452 | File: public/mtg-commander.html

## Findings

### `textContent` used for all Scryfall fields — correct XSS prevention
**Severity:** Informational
**Lines:** 1441–1444
`card.name`, `card.mana_cost`, `card.type_line`, and `card.oracle_text` are all set via `textContent`, not `innerHTML`. This is the correct pattern and prevents XSS regardless of what Scryfall returns.
**Action:** No action needed. Document this as the intended pattern for modal field population.

### `modal-img.src` set to Scryfall URL from API response
**Severity:** Low
**Lines:** 1440
`imgUrl` comes from `card.image_uris?.normal` — a Scryfall CDN URL injected directly into an `img src`. This is a trust-Scryfall concern. If a compromised Scryfall response contained a `javascript:` URL, `img.src` would not execute it (browsers block `javascript:` in `img src`), so the practical risk is negligible.
**Action:** No action needed for `img src`. Document that Scryfall CDN URLs are trusted.

## Summary
Security review is clean. `textContent` is used correctly for all text fields, preventing XSS. The image URL from Scryfall is safe in an `img src` context.
