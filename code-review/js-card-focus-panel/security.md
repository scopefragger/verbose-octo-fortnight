# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### `idStr` (UUID) used raw in `onclick` handlers without structural safety
**Severity:** Medium
**Lines:** 1945–1951
`const idStr = JSON.stringify(id)` is embedded into `onclick` attributes for all focus panel action buttons (tapCard, returnToHand, putOnTop, sendToGrave, sendToExile). `JSON.stringify` of a UUID string produces a quoted string like `"\"uuid-here\""`, which is safe for UUIDs. However, this relies on `id` always being a UUID. If `id` were a string containing `"` followed by `);maliciousCode(//`, `JSON.stringify` would produce output that closes the JS string and injects code.
**Action:** Use `data-*` attributes with `dataset` lookups in event handlers rather than embedding IDs in `onclick` strings.

### `idx` (integer) passed directly into `onclick` without validation
**Severity:** Low
**Lines:** 1988
`onclick="playHandCardFromFocus(${idx})"` and `onclick="discardFromHand(${idx})"` embed the hand card index directly. Since `idx` is a loop counter from `.map((card, i) => ...)`, it is always a non-negative integer at render time, so there is no injection risk here. However, it is good practice to note this.
**Action:** No immediate action required; document that `idx` is always an integer from the render loop.

### Card text fields set via `textContent` — correctly safe
**Severity:** Info
**Lines:** 1939–1942, 1978–1981
`card.name`, `card.mana_cost`, `card.type_line`, and `card.oracle_text` are all set via `.textContent = ...`, which automatically prevents XSS. This is the correct pattern for displaying user/API data.
**Action:** No action required. This is correct and should be maintained.

## Summary
The main concern is the `JSON.stringify(id)` pattern for embedding IDs in `onclick` attributes — safe for UUIDs but structurally fragile. The correct use of `textContent` for card text fields is commendable and avoids XSS entirely. Recommend migrating to `data-*` attributes for ID passing.
