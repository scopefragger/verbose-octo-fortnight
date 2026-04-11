# Patterns Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` and `escapeQuotes` serve different contexts but have similar names
**Severity:** Low
**Lines:** 2142–2147
`escapeHtml` is for HTML text content / attribute values; `escapeQuotes` is for JavaScript string arguments inside inline event handlers. The naming doesn't make this distinction obvious. A developer could reasonably use either in the wrong context.
**Action:** Rename to `escapeForHtml(str)` and `escapeForJsAttr(str)` (or add JSDoc comments) to make the intended context explicit.

### Toast duration is a magic number
**Severity:** Low
**Lines:** 2155
`3000` ms is hard-coded. See Static review for the named constant recommendation.
**Action:** Define `const TOAST_DURATION_MS = 3000;`.

### CSS class string assembled via string concatenation
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + (isError ? ' error' : '');` assembles a class list via concatenation. A more robust pattern would use `el.classList` methods to toggle individual classes:
```js
el.classList.add('show');
el.classList.toggle('error', isError);
```
This avoids accidentally clobbering classes set elsewhere and is easier to read.
**Action:** Refactor to use `el.classList` methods.

### `String(str)` coercion in both escape functions — consistent defensive pattern
**Severity:** Low (informational)
**Lines:** 2143, 2146
Both `escapeHtml` and `escapeQuotes` start with `String(str)` to handle non-string inputs. This is a good defensive pattern.
**Action:** No change needed. Document this intentional coercion with a brief comment.

### `formatManaCostShort` uses `.slice(0, 10)` truncation — magic number
**Severity:** Low
**Lines:** 1644 (not in this segment, but part of the utilities group)
The `formatManaCostShort` function slices to 10 characters without explanation. Long mana costs (e.g., `WWWWWWWWWW`) would be truncated silently.
**Action:** Define `const MANA_COST_DISPLAY_MAX = 10;` and use it in the slice call.

## Summary
The utilities section is functional but has naming clarity issues (`escapeHtml` vs `escapeQuotes` context distinction), a magic timeout constant, and a className manipulation pattern that could be modernised to use `classList`. The security issues in the escaping functions (see security.md) are the highest priority to address.
