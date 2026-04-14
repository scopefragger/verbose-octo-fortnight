# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `focus-actions` innerHTML assembled with `JSON.stringify(id)` in onclick handlers
**Severity:** Low
**Lines:** 1945–1952
The action buttons use `JSON.stringify(id)` to embed the battlefield card ID. Since `id` is a UUID assigned by the application (not user input), this is safe. If the ID format changed to accept user-defined strings, the JSON encoding alone would not prevent script injection in event handler context.
**Action:** Document that `bfc.id` must remain an application-controlled UUID. No code change needed.

### `focus-actions` innerHTML built with raw `idx` (integer) for hand cards
**Severity:** Low
**Lines:** 1986–1991
`onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx})"` inject the hand card index as a bare integer. Integers cannot carry XSS payloads, so this is safe. The `${idx}` comes from a `.map((card, i) => ...)` index, not user input.
**Action:** No action needed.

### `focus-img` src set directly from card API data
**Severity:** Low
**Lines:** 1935–1938, 1972–1977
`document.getElementById('focus-img').src = img` assigns a Scryfall URL directly. As noted in the Render Play Area review, URLs should be validated to start with `https://` to prevent potential `javascript:` URI injection if the card data were tampered with.
**Action:** Add: `if (img && img.startsWith('https://')) { el.src = img; }` before assigning.

### Card text fields set via `textContent` (safe)
**Severity:** Low
**Lines:** 1939–1942
`focus-name`, `focus-mana`, `focus-type`, `focus-oracle` are all set via `.textContent` rather than `.innerHTML`, which is the correct approach and prevents XSS from card text data.
**Action:** No action needed. This is good practice.

## Summary
The section correctly uses `textContent` for all card text fields, which prevents XSS from oracle text, card names, and mana costs. The main risk is image URL injection, which is low severity given the Scryfall data pipeline. No high-severity findings.
