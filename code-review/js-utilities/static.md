# Static Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is listed in the section description but defined at line 1642, not within 2141–2156
**Severity:** Low
**Lines:** 1642 (actual), 2141–2156 (stated range)
The segment description lists `formatManaCostShort()` as part of the Utilities section, but the function is actually defined at line 1642 — more than 500 lines earlier, adjacent to `COMMON_TOKENS`. This misplacement makes the utilities hard to discover and means the stated line range for this section is incomplete.
**Action:** Either move `formatManaCostShort` to sit alongside the other utility functions near line 2141, or correct the section description to reflect its actual location.

### `escapeHtml` does not escape single quotes
**Severity:** Medium
**Lines:** 2142–2144
`escapeHtml` escapes `&`, `<`, and `>` but not `'` (single quote / `&#39;`) or `"` (double quote / `&quot;`). This is sufficient for element text content, but the function is also used in HTML attribute values (e.g. `alt="${escapeHtml(card.name)}"` in segment 21, line 2048). In a double-quoted attribute, an unescaped `"` in `card.name` would break the attribute boundary.
**Action:** Add quote escaping: `.replace(/"/g, '&quot;').replace(/'/g, '&#39;')`. Alternatively, document clearly that `escapeHtml` is safe only for text-node content, not attribute values, and use a stricter escape function for attributes.

### `escapeQuotes` produces invalid HTML-in-JS escaping
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` escapes `'` as `\'` (a JavaScript backslash-escape) and `"` as `&quot;` (an HTML entity). This mixing of contexts is incorrect:
- In a JavaScript string literal within an HTML `onclick` attribute, `\'` is valid JS but is passed through the HTML parser first, where backslash has no special meaning — so the backslash is a literal character and the `'` still closes the JS string.
- `&quot;` is decoded to `"` by the HTML parser before the JS engine sees it, which can then close an outer double-quoted JS string.

This function is used in multiple `onclick` contexts throughout the file (segments 19–22). It provides a false sense of safety while potentially being both overly restrictive in some cases and insufficiently protective in others.
**Action:** Rename this function to something that makes its limitations clear (e.g. `escapeForOnclickAttr`) and add a prominent warning comment. Better: eliminate all uses by switching to `data-` attributes + `addEventListener` delegation (as recommended in the security reviews for segments 21 and 22).

### `toastTimer` is an implicit module-level variable with no type annotation
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared without an initialiser, making it `undefined` until first use. `clearTimeout(undefined)` is harmless (a no-op), so there is no bug here, but the intent is clearer with `let toastTimer = null;`.
**Action:** Initialise to `null`: `let toastTimer = null;` to make the intent explicit.

### `showToast` does not guard against a missing `toast` element
**Severity:** Low
**Lines:** 2151–2155
`document.getElementById('toast')` is used without a null check. If the `#toast` element is absent, `el.textContent = msg` throws a TypeError.
**Action:** Add a guard: `const el = document.getElementById('toast'); if (!el) return;`.

## Summary
The utilities section contains two functions with significant correctness issues: `escapeHtml` does not escape quotes (limiting its safe use to text nodes only), and `escapeQuotes` uses a mixed HTML/JS escaping strategy that is incorrect for the `onclick` attribute context where it is applied throughout the file. These are the highest-priority findings across the entire codebase review.
