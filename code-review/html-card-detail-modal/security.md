# Security Review — Card Detail Modal
Lines: 1013–1026 | File: public/mtg-commander.html

## Findings

### Toast element content set via `textContent` — safe
**Severity:** Low (informational)
**Lines:** 1029 / 2151–2152
`showToast()` assigns user-visible messages via `el.textContent`, which is safe — no XSS risk here.
**Action:** No action required. This is a positive pattern worth preserving.

### Card data written to DOM via `textContent` — safe
**Severity:** Low (informational)
**Lines:** 1441–1444 (in `showCardDetail()`)
All card fields (`card.name`, `card.mana_cost`, `card.type_line`, `card.oracle_text`) are set through `textContent` assignments, not `innerHTML`. Even though these values come from an external API (Scryfall), using `textContent` prevents any injected HTML or script from executing.
**Action:** No action required. This is the correct approach.

### Image `src` set from external API URL without validation
**Severity:** Low
**Lines:** 1440
`document.getElementById('modal-img').src = imgUrl;` where `imgUrl` is derived directly from the Scryfall API response (`card.image_uris?.normal`). An attacker who could tamper with the API response (e.g., via a compromised network or a rogue Scryfall-like proxy) could inject a `javascript:` URI or a tracking pixel URL. In practice, Scryfall is a trusted third-party and the risk is minimal, but there is no protocol check.
**Action:** Consider validating that `imgUrl` starts with `https://` before assigning it to `src`. A one-liner guard: `if (imgUrl && imgUrl.startsWith('https://')) { ... }`.

### `onclick` handler on overlay invokes `closeModal(event)` — event parameter exposed
**Severity:** Low (informational)
**Lines:** 1013
Passing the raw DOM `event` object into an inline `onclick` handler is normal practice and does not create a security issue here. The function only reads `e.target`.
**Action:** No action required.

## Summary
The card detail modal and toast are implemented securely. All card text content is inserted via `textContent`, preventing XSS from Scryfall API data. The only notable item is a lack of URL-scheme validation on the image `src`, which is a low-risk hardening opportunity rather than an exploitable vulnerability in the current deployment context.
