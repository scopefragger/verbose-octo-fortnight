# Static Code Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape double quotes
**Severity:** Medium
**Lines:** 2143
`escapeHtml` escapes `&`, `<`, and `>` but does not escape `"` (double quote). This is safe for text content (between tags), but if `escapeHtml` is used in a double-quoted HTML attribute, a value containing `"` would break out of the attribute. Looking at usage in the file, `escapeHtml` is used in both text content and `alt="..."` attributes. A card name containing a double quote (which is unusual in MTG but not impossible) would be an issue.
**Action:** Add `replace(/"/g, '&quot;')` to `escapeHtml` to make it safe for both text content and attribute values.

### `escapeQuotes` mixes backslash escaping and HTML entity encoding
**Severity:** Medium
**Lines:** 2146
`escapeQuotes` replaces `'` with `\'` (JavaScript string escaping) and `"` with `&quot;` (HTML entity encoding). These are two different escaping contexts mixed in a single function. `\'` is for use inside single-quoted JS strings; `&quot;` is for HTML attribute values. The result is a function that is neither correctly safe for raw JS nor for HTML, and may fail in contexts expecting only one of the two encodings.
**Action:** Separate into two functions: `escapeForJsString(str)` (backslash-escapes quotes) and ensure `escapeHtml` handles `"`. Document clearly which function to use in which context.

### `showToast` does not guard against null `toast` element
**Severity:** Low
**Lines:** 2151
`document.getElementById('toast')` is called without a null guard. If the toast element is absent from the DOM, the subsequent `.textContent` assignment will throw a TypeError.
**Action:** Add: `const el = document.getElementById('toast'); if (!el) return;`.

### `formatManaCostShort` described in this section but located at line 1642
**Severity:** Low
**Lines:** 1642–1645 (outside this range)
The SEGMENTS.MD description for this section includes `formatManaCostShort()`, but it is defined at line 1642, adjacent to the play-state section rather than in the utilities section. This is a misplacement that makes the function harder to find.
**Action:** Move `formatManaCostShort` to the utilities section at line 2141.

## Summary
The utility functions are foundational but have two significant issues: `escapeHtml` does not escape double quotes (making it unsafe for attribute values), and `escapeQuotes` mixes two incompatible escaping strategies in one function. Both should be corrected as they affect XSS safety throughout the file.
