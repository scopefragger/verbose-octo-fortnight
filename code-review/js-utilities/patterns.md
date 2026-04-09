# Patterns Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` and `escapeQuotes` use chained `.replace()` — no shared regex utility
**Severity:** Low
**Lines:** 2142–2147
Both functions use multiple chained `.replace()` calls. `escapeHtml` does three replacements; `escapeQuotes` does two. This is readable but could be slightly more efficient with a single regex that matches any special character. Not a significant issue at this scale.
**Action:** No action required at current scale. Note that adding `"` escaping to `escapeHtml` will require a fourth `.replace()` call.

### `formatManaCostShort` is placed in the play-state area (line 1642) but documented under "Utilities"
**Severity:** Low
**Lines:** 1642–1645 (vs section 2141)
SEGMENTS.MD lists `formatManaCostShort` as part of the Utilities section (JS #23, lines 2141–2156), but the function is actually defined at line 1642 in the play-state area. This mismatch between documentation and code placement makes the function harder to find.
**Action:** Either move `formatManaCostShort` to be adjacent to the other utility functions or add a comment at line 1642 noting it is a utility function.

### Toast `className` assignment replaces all classes
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + (isError ? ' error' : '')` replaces the entire className string rather than using `classList`. If the toast element ever has additional classes (e.g. for positioning or theming), they would be stripped on every `showToast` call.
**Action:** Use `el.classList.remove('error'); el.classList.add('show'); if (isError) el.classList.add('error');` for class management.

### Hide toast by `className = 'toast'` — strips the `show` class rather than removing it
**Severity:** Low
**Lines:** 2155
`el.className = 'toast'` removes the `show` class to hide the toast by resetting all classes. Same issue as above — any additional classes would be stripped.
**Action:** Replace with `el.classList.remove('show', 'error')` for consistent class management.

## Summary
The utilities section's patterns are mostly sound. The main issues are: `formatManaCostShort` is misplaced relative to where SEGMENTS.MD says it lives, and `showToast` uses `className` assignment (which clobbers all classes) rather than `classList` methods (which are additive). The `escapeHtml` double-quote omission is covered in the security review.
