# Static Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `formatManaCostShort` is defined at line 1642, not in the Utilities section
**Severity:** Low
**Lines:** 1642–1645
The SEGMENTS.MD description lists `formatManaCostShort()` as part of the Utilities section (2141–2156), but the function is actually defined at line 1642, between the Play State section and the Token Definitions section. It is absent from the Utilities block. This is a documentation/organisation error — the function exists and works, but is not co-located with the other utilities.
**Action:** Move `formatManaCostShort` to the Utilities section (after `escapeQuotes`) so all utility functions are in one place.

### `showToast` does not guard against a missing `#toast` element
**Severity:** Medium
**Lines:** 2151
`document.getElementById('toast')` is not null-checked. If the element is absent (e.g. during tests, or if the HTML is restructured), the subsequent `el.textContent = msg` will throw a `TypeError`. The toast element exists at line 1029 in the current HTML, but the defensive pattern expected throughout the codebase is absent here.
**Action:** Add `if (!el) return;` after the `getElementById` call.

### `toastTimer` is a module-level `let` with no initial value — implicit `undefined`
**Severity:** Low
**Lines:** 2149
`let toastTimer;` is declared without an initial value (implicitly `undefined`). `clearTimeout(undefined)` is a no-op (valid but slightly misleading), so the first call to `showToast` works correctly. However, the variable naming and absence of `= null` makes the intent less clear.
**Action:** Initialise explicitly: `let toastTimer = null;` to communicate that it is intentionally unset rather than accidentally uninitialised.

### `escapeHtml` does not escape double-quote characters
**Severity:** Medium
**Lines:** 2143
`escapeHtml` escapes `&`, `<`, and `>` but not `"` (double quote) or `'` (single quote). This is sufficient for HTML text content but insufficient for use inside HTML attribute values delimited by double quotes. Throughout the file, `escapeHtml` is used in `alt="${escapeHtml(...)}"` (lines 1426, 1891, 1918, 2048) — here `"` in a card name would prematurely close the attribute, potentially introducing an injection vector.

Example: `alt="${escapeHtml('He said "hello"')}"` produces `alt="He said "hello""` which terminates the attribute at the second `"`.
**Action:** Add `"` escaping: `.replace(/"/g, '&quot;')` to `escapeHtml`, making it safe for both text content and double-quoted attribute values. Audit all `alt=`, `title=`, and similar attribute usages.

### `escapeQuotes` escapes single quotes as `\'` — incorrect for HTML attributes
**Severity:** Medium
**Lines:** 2146
`escapeQuotes` replaces `'` with `\'` (a backslash-escaped single quote, valid inside a JavaScript string literal) and `"` with `&quot;` (an HTML entity). The function is used in `onclick="...'${escapeQuotes(name)}'..."` contexts (lines 2047, 2118). 

The `\'` escape is appropriate for JS string literals inside `onclick` attributes but has two weaknesses: (1) backslashes in the input are not escaped, so `\` followed by `'` in the name defeats the escaping (flagged in Security reviews for Graveyard Viewer and Commander Autocomplete), and (2) the mixed `\'` / `&quot;` approach requires callers to know which delimiter context they are in.
**Action:** Add backslash escaping first: `.replace(/\\/g, '\\\\')` before replacing `'`, ensuring `\'` cannot be neutralised by a preceding `\`. Consider renaming to `escapeForJsString` to make the intended context explicit.

## Summary
The utilities section contains critical escaping functions that are used for XSS prevention across the entire file. The two most important findings are: `escapeHtml` missing `"` escaping (breaking double-quoted attribute safety) and `escapeQuotes` missing backslash escaping (allowing `\'` neutralisation). Both are medium-severity issues that affect security across many call sites.
