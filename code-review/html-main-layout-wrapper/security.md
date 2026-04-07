# Security Review — Main Layout Wrapper
Lines: 785–965 | File: public/mtg-commander.html

## Findings

### `id="critique-text"` — unsanitized innerHTML injection point
**Severity:** High
**Lines:** 893
`<div id="critique-text" ...></div>` is the target element for AI critique output. Based on the JS segment table (Section 10, `critiqueHand()`), LLM response text is written into this element. If the response is assigned via `.innerHTML` rather than `.textContent`, any HTML/script content returned by the Groq API (or injected via a compromised/proxied response) will execute in the user's browser. The HTML itself is an empty container, but the risk is entirely in how JS populates it.
**Action:** Verify that `critiqueHand()` in JS Section 10 sets `critique-text` via `.textContent` (or a sanitising helper like `escapeHtml()`, which exists in JS Section 23) rather than `.innerHTML`. If `.innerHTML` is used, switch to `.textContent` or pass the string through `escapeHtml()` first.

### `id="focus-oracle"` and `id="focus-actions"` — dynamic card text injection
**Severity:** Medium
**Lines:** 946–947
These elements display oracle text and action buttons built from Scryfall API card data. If the card's oracle text or name is inserted via `.innerHTML` without escaping, a crafted Scryfall response (or a card with unusual unicode/HTML-like characters in its name) could inject markup. `escapeHtml()` exists in the codebase (JS Section 23) but its actual use at these injection points cannot be confirmed from the HTML alone.
**Action:** Audit `selectBFCard()` and `selectHandCard()` in JS Section 18 to confirm all Scryfall-derived strings going into `focus-oracle` and `focus-actions` pass through `escapeHtml()`.

### `id="deck-list-content"` — innerHTML from saved deck data
**Severity:** Medium
**Lines:** 837
This container is populated from `renderDeckList()` (JS Section 9), which sources card names from `deck[]` — data that originally came from a user-pasted decklist and from Scryfall. Card names inserted via `.innerHTML` without escaping are an XSS vector if card name data is ever stored and re-rendered (e.g. from the saved decks API). The `escapeHtml()` utility exists; its use here needs confirmation.
**Action:** Confirm `renderDeckList()` escapes all card name strings before inserting into innerHTML.

### No secrets in this HTML block
**Severity:** N/A
**Lines:** 785–965
No API keys, tokens, or credentials are present in this markup section. The `?secret=` URL parameter handling is in JS Section 2 and is outside this block.

## Summary
The HTML in this block is structurally inert — the real XSS risk lives in how JavaScript populates the dynamic content containers (`critique-text`, `focus-oracle`, `focus-actions`, `deck-list-content`). The project does have an `escapeHtml()` utility, so the primary action is to audit the JS population sites for those four IDs and confirm it is consistently applied. The `critique-text` element fed by an external LLM API is the highest-priority verification target.
