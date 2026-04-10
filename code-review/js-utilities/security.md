# Security Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` incomplete — does not escape double quotes
**Severity:** High
**Lines:** 2143
`escapeHtml(str)` escapes `&`, `<`, and `>` but omits `"` (double quote). This function is used in `alt="..."` attributes throughout the file (e.g., `alt="${escapeHtml(card.name)}"`). A card name containing a `"` character would break out of the attribute value and could allow attribute injection. While real MTG card names don't contain double quotes, the function is a general-purpose utility and should be safe for all contexts.
**Action:** Add `replace(/"/g, '&quot;')` to the `escapeHtml` implementation.

### `escapeQuotes` mixes JS and HTML escaping — creates false security
**Severity:** High
**Lines:** 2146
`escapeQuotes` was presumably intended to make values safe for embedding in onclick string arguments. However, it applies `\'` (JS backslash escape) for single quotes and `&quot;` (HTML entity) for double quotes. This combination is dangerous:

1. When used in `onclick='fn("${escapeQuotes(val)}")'`, the `&quot;` encoding for `"` is incorrect — HTML will decode `&quot;` back to `"` before the JavaScript is evaluated, so the escaping has no effect in that context.
2. When used in `onclick="fn('${escapeQuotes(val)}')"`, the `\'` backslash escape is valid JS but the double-quote HTML encoding is unnecessary overhead.

The function does not reliably protect against injection in either common usage pattern.
**Action:** Replace with a single consistent approach: use `data-*` attributes and event delegation to avoid embedding user data in onclick attributes entirely, which eliminates the need for this function.

### `showToast` uses `textContent` for message — correctly safe
**Severity:** N/A
**Lines:** 2152
`el.textContent = msg` correctly prevents XSS even if the `msg` string contains HTML characters. Toast messages from callers are not injected into innerHTML.

## Summary
Two high-severity security issues: `escapeHtml` does not escape double quotes (incomplete for attribute contexts), and `escapeQuotes` uses an incorrect combination of JS and HTML escaping that does not reliably prevent injection. These are the most critical findings across the entire file review, as they affect the security primitives used by all other sections.
