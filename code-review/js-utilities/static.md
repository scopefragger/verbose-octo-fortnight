# Static Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is not in this section despite being listed in the segment description
**Severity:** Low (documentation)
**Lines:** 1642–1645 (actual location), listed in segment as 2141–2156
`formatManaCostShort` is defined at line 1642 (in the Play State section), not in the Utilities section. The SEGMENTS.MD description is inaccurate.
**Action:** Either move `formatManaCostShort` to the Utilities section for correctness, or update the section description to reflect its actual location.

### `escapeHtml` does not escape double-quotes
**Severity:** Medium
**Lines:** 2143
`escapeHtml` replaces `&`, `<`, `>` but does not replace `"` with `&quot;`. When `escapeHtml()` output is used inside an HTML attribute value bounded by double-quotes (e.g., `alt="${escapeHtml(card.name)}"`), a card name containing a literal double-quote would break out of the attribute.
Scryfall card names do not typically contain double-quotes, but the function should be defensive.
**Action:** Add `.replace(/"/g, '&quot;')` to `escapeHtml` so it is safe for attribute contexts as well as text content.

### `escapeQuotes` replaces `"` with `&quot;` — mixing HTML entity encoding with JS escaping
**Severity:** Medium
**Lines:** 2146
`escapeQuotes` is designed for use inside single-quoted JavaScript string arguments within onclick attributes. It correctly backslash-escapes single-quotes (`'` → `\'`), but replaces double-quotes with the HTML entity `&quot;` rather than backslash-escaping them (`\"`). Inside a JavaScript string context (not an HTML attribute context), `&quot;` would be a literal 5-character sequence, not a double-quote.
In practice, since these onclick strings are in an HTML attribute (which the browser HTML-decodes before executing), `&quot;` becomes `"` before the JS runs — so the current approach accidentally works. However, the function mixes two encoding contexts in a confusing way.
**Action:** Clarify the intended usage context in a comment. If the function is strictly for use inside single-quoted JS strings in HTML attributes, document this. Consider also escaping backslashes (`\` → `\\`) to prevent injection via card names with backslashes.

### `toastTimer` is a module-level variable with no clear connection to the toast element
**Severity:** Low
**Lines:** 2149
`toastTimer` is a bare module-level variable. Its name is sufficient but it has no encapsulation — it could be accidentally overwritten or cleared by other code.
**Action:** Consider wrapping `showToast` and `toastTimer` in a closure or IIFE for better encapsulation, or at minimum prefix it (e.g., `_toastTimer`) to signal it is private.

### Toast auto-dismiss delay (3000ms) is a magic number
**Severity:** Low
**Lines:** 2155
The 3-second toast display duration is a hard-coded magic number.
**Action:** Define `const TOAST_DURATION_MS = 3000;` near the top of the utilities section.

## Summary
The utilities section is small but has two real issues: `escapeHtml` missing double-quote escaping (making it unsafe for attribute contexts), and `escapeQuotes` mixing JS and HTML encoding contexts in a way that works by accident. Both should be addressed before the codebase grows.
