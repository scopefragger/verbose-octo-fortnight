# Patterns Review — Utilities
Lines: 2141–2156 (plus `formatManaCostShort` at 1642–1645) | File: public/mtg-commander.html

## Findings

### `escapeHtml` is a custom implementation of a well-known utility — missing `"` and `'`
**Severity:** Medium
**Lines:** 2142–2144
The custom `escapeHtml` only handles 3 of the 5 HTML special characters (`&`, `<`, `>`), omitting `"` and `'`. The conventional implementation handles all 5. This incomplete coverage is a pattern mismatch with the expected contract of an `escapeHtml` function.
**Action:** Add `.replace(/"/g, '&quot;').replace(/'/g, '&#39;')` or use the standard 5-character replacement set.

### `escapeQuotes` has a confusing name and mixed-context behavior
**Severity:** Medium
**Lines:** 2145–2147
`escapeQuotes` mixes JS escaping (`'` → `\'`) with HTML entity encoding (`"` → `&quot;`). This is a hybrid that works only in one specific context (JS string argument inside a double-quoted HTML attribute). The function name does not convey this restriction.
**Action:** Rename to `escapeForJsInHtmlAttribute` (or a shorter convention-aligned name) and add a JSDoc comment specifying the context: `// Safe for: onclick="fn('${escapeForJsInHtmlAttribute(val)}')"`.

### Magic number `3000` for toast duration
**Severity:** Low
**Lines:** 2155
`setTimeout(..., 3000)` uses a magic number for the toast display duration. This should be a named constant.
**Action:** Define `const TOAST_DURATION_MS = 3000;` near `showToast` or at the top of the JS constants section.

### Magic number `10` in `formatManaCostShort` truncation
**Severity:** Low
**Lines:** 1644
`.slice(0, 10)` uses a magic number with no explanation. Should be a named constant with a comment.
**Action:** Define `const MANA_COST_DISPLAY_MAX_LEN = 10;` near the function with a comment noting the UI space constraint.

### `showToast` `el.className` assignment could conflict with other class modifications
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + (isError ? ' error' : '')` replaces the entire `className` string. If any other code adds a class to the toast element (e.g. for animation), it would be lost on the next `showToast` call. Using `classList.add`/`classList.remove` would be more robust.
**Action:** Replace with: `el.classList.add('show'); if (isError) el.classList.add('error'); else el.classList.remove('error');`.

## Summary
The utility functions work correctly for their intended uses but have two pattern issues worth fixing: `escapeHtml` incompletely handles HTML special characters (a security gap), and `escapeQuotes` has a confusing name and mixed escaping strategy. Both should be addressed as part of a broader XSS remediation effort across the file.
