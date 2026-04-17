# Architecture Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is defined outside the Utilities section
**Severity:** Low
**Lines:** 1642–1645
`formatManaCostShort` is described as a utility function but lives at line 1642 — between the Play State and Token Definitions sections — rather than in the Utilities block (2141–2156). This means the "utilities" are split across two locations in the file. Developers looking for escape/format utilities in the `=== UTILS ===` section will not find it.
**Action:** Move `formatManaCostShort` to the Utilities section. Since it is referenced at line 1916, it must be defined before that point; if moving it would violate hoisting requirements (it's a `function` declaration, so hoisting is fine), simply relocate it to the Utilities block.

### `toastTimer` module-level variable is a hidden side effect of `showToast`
**Severity:** Low
**Lines:** 2149, 2154–2155
`toastTimer` is a module-level variable exclusively managed by `showToast`. It represents persistent UI state (a pending timeout handle) stored in the global scope. If `showToast` were ever called from multiple contexts (e.g. both a game event and a background operation simultaneously), the timer variable is shared and the first timer would be cancelled by the second call.
**Action:** This is the correct pattern for a singleton toast — only one toast is shown at a time, and `clearTimeout` before setting a new one is the right approach. Document the intent with a comment: `// Single shared timer — ensures only one toast is visible at a time`.

### Utility functions lack JSDoc documentation
**Severity:** Low
**Lines:** 2142–2156
None of the utility functions have JSDoc comments documenting their parameters, return types, or — critically — the escaping context each function is safe for. Given that `escapeHtml` and `escapeQuotes` are subtly different tools for different contexts, a brief comment on each would prevent misuse.
**Action:** Add brief JSDoc comments:
```js
/** Escapes HTML special chars for safe injection into HTML text content and double-quoted attributes. */
function escapeHtml(str) { ... }
/** Escapes quotes and backslashes for safe injection into single-quoted JS string literals inside HTML onclick attributes. */
function escapeQuotes(str) { ... }
```

### No `getCardImageUrl` utility despite repeated identical image-URL resolution expressions
**Severity:** Medium
**Lines:** 2141–2156
The pattern `card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` appears in at least six locations in the file (lines 1116, 1423, 1935, 1972, 2046, and the autocomplete section). A `getCardImageUrl(card, size = 'normal')` utility function should live here alongside the other utilities, yet it is absent.
**Action:** Add:
```js
function getCardImageUrl(card, size = 'normal') {
  return card?.image_uris?.[size] || card?.card_faces?.[0]?.image_uris?.[size] || '';
}
```
Then replace all inline occurrences throughout the file.

## Summary
The Utilities section is the right place for shared helper functions, but it is incomplete — `formatManaCostShort` lives elsewhere, and the most-duplicated pattern in the file (`getCardImageUrl`) has no helper at all. Adding JSDoc to clarify the escaping context of `escapeHtml` and `escapeQuotes` would prevent the misuse already observed in multiple sections.
