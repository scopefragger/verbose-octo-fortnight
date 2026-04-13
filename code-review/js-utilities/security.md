# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is used throughout the codebase as the primary XSS defense
**Severity:** Medium
**Lines:** 2142–2144
`escapeHtml` correctly escapes `&`, `<`, and `>`, which is sufficient for preventing HTML tag injection in text nodes and double-quoted attribute values. However, as noted in the static review, it does not escape single quotes (`'`). Any consumer using `escapeHtml` for a single-quoted attribute context would be vulnerable to XSS via `'onmouseover='alert(1)`.
**Action:** Add `.replace(/'/g, '&#39;')` to `escapeHtml` to make it safe for all HTML attribute contexts.

### `escapeQuotes` is misnamed and insufficient as an XSS defense
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` is used in several places to sanitize data placed inside JavaScript function calls embedded in HTML `onclick` attributes. The function escapes `'` to `\'` and `"` to `&quot;`. This does NOT constitute XSS prevention because:
1. A string value containing `\` followed by a single quote can bypass the escaping (e.g., `foo\'`).
2. The `&quot;` entity encoding for `"` is decoded by the browser's HTML parser before the JS interpreter runs, so double quotes are effectively unescaped when the JS executes.
The only safe approach is to avoid putting user/API data into inline `onclick` handlers entirely.
**Action:** Remove all usages of `escapeQuotes` in security-sensitive contexts (inline onclick handlers with external data). Replace with data attributes and JS event listeners.

### `showToast` uses `el.textContent` — safe
**Severity:** Low
**Lines:** 2152
Toast messages are set via `textContent`, which prevents HTML injection. Even if an error message from the server contains HTML tags, they will be displayed as literal text.
**Action:** No change needed. `textContent` is the correct and safe assignment here.

## Summary
`escapeQuotes` provides a false sense of security. It is used in multiple places to "sanitize" card names and other external data for inline onclick handlers, but it does not prevent all injection vectors. The only real fix is to stop using inline onclick handlers for any data from external sources (Scryfall API, database). This is the most systemic security finding across the entire codebase.
