# Code & Pattern Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` name does not signal its limited scope
**Severity:** Low
**Lines:** 2142
The function is named `escapeHtml` but only safely escapes for HTML body context (not attributes). A name like `escapeHtmlBody` or `escapeText` would more accurately signal the limitation and prevent misuse in attribute contexts.
**Action:** Rename to `escapeText` or expand the function to handle all HTML contexts (body + attributes) as described in the security review.

### `escapeQuotes` is inconsistently named vs `escapeHtml`
**Severity:** Low
**Lines:** 2145
`escapeHtml` escapes for HTML, `escapeQuotes` escapes quotes — but `escapeQuotes` is actually used for HTML onclick attribute context, not generic quote escaping. A name like `escapeAttrString` or `escapeJsArg` would better communicate its intended use.
**Action:** Rename to `escapeJsArg` and update all call sites, or replace all call sites with `JSON.stringify` (which is more robust).

### `toastTimer` variable name is generic
**Severity:** Low
**Lines:** 2149
`let toastTimer;` — a bare variable at module level. If more timers are added (e.g., for auto-save, session expiry), `toastTimer` is fine but other timers should follow a consistent naming pattern.
**Action:** No immediate action. Establish a pattern comment: `// UI Timers` before this declaration.

### `showToast` hardcodes `3000`ms display duration
**Severity:** Low
**Lines:** 2155
The 3-second toast duration is a magic number. Error toasts may benefit from a longer display time.
**Action:** Define `const TOAST_DURATION_MS = 3000` and optionally `const TOAST_ERROR_DURATION_MS = 5000`. Pass duration as an optional third parameter: `showToast(msg, isError, duration = isError ? 5000 : 3000)`.

### `showToast` assigns `el.className` as a string rather than using `classList`
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + (isError ? ' error' : '');` directly overwrites the className string. If the toast element has any other persistent CSS classes, they would be lost. Using `classList.remove(...); classList.add(...)` is safer.
**Action:** Rewrite as:
```js
el.classList.remove('error');
el.classList.add('show');
if (isError) el.classList.add('error');
```
And in the timer callback: `el.classList.remove('show', 'error')`.

## Summary
The utilities section has several naming inconsistencies and minor pattern issues, with `showToast` using a magic duration and className string assignment instead of classList manipulation. The most impactful change would be fixing `escapeHtml` to be truly safe for all HTML contexts and replacing `escapeQuotes` with `JSON.stringify` at all call sites — these are the foundational XSS prevention utilities for the entire file.
