# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `focus-actions` innerHTML built with `JSON.stringify(id)` — safe for numeric IDs only
**Severity:** Low
**Lines:** 1945–1952
`idStr = JSON.stringify(id)` is used to inject the card ID into onclick attributes. Since `id` is always `Date.now() + Math.random()` (a number), `JSON.stringify` produces a safe numeric literal. However, if the ID type ever changes to a string (e.g., UUID from a database), this pattern would require `escapeQuotes()` or similar escaping.
**Action:** Add a comment asserting that `bfc.id` is always numeric, or switch to a data-attribute approach to avoid inline event handlers with dynamic values entirely.

### `idx` (hand card index) injected directly into onclick attribute
**Severity:** Low
**Lines:** 1988–1989
The hand card index `idx` is a plain integer and is safe to interpolate. However, the pattern of injecting JavaScript arguments into inline event handlers is fragile as a general practice. No immediate security risk since the value is always a loop index.
**Action:** Document that `idx` values are always array indices (integers). Consider switching to `data-idx` attributes with a delegated event listener for better separation.

### Card text content (`card.name`, `card.oracle_text`, etc.) set via `textContent`
**Severity:** Low (handled correctly)
**Lines:** 1939–1942, 1978–1981
Card data is assigned via `textContent` rather than `innerHTML`, which correctly prevents XSS for these fields. This is good practice.
**Action:** No change needed. Retain use of `textContent` for all user/API-sourced text fields.

## Summary
No high-severity security issues. The use of `textContent` for card data is correct. The main concern is the pattern of injecting IDs into inline event handlers, which is safe now but brittle if ID types change.
