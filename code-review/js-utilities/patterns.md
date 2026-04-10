# Code & Pattern Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### Toast dismissal duration is a magic number
**Severity:** Low
**Lines:** 2155
`setTimeout(() => { el.className = 'toast'; }, 3000)` uses `3000` (3 seconds) as the dismissal delay. This is a magic number with no named constant.
**Action:** Define `const TOAST_DURATION_MS = 3000;` and reference it in `showToast`.

### `showToast` resets className directly instead of toggling classes
**Severity:** Low
**Lines:** 2153, 2155
`el.className = 'toast show' + (isError ? ' error' : '')` and `el.className = 'toast'` directly set the full `className` string. If any other CSS class were ever added to the toast element (e.g., an animation class), this would silently remove it.
**Action:** Use `classList` methods: `el.classList.remove('show', 'error'); el.classList.add('show'); if (isError) el.classList.add('error');`.

### `escapeHtml` is minimal — `'` (single quote) not escaped
**Severity:** Low
**Lines:** 2143
While the main security concern (missing `"` escaping) is covered in the security review, it is also worth noting for patterns: `'` (single quote / apostrophe) is not escaped either. In HTML text content this is safe, but in attributes it depends on which quote character delimits the attribute.
**Action:** For a complete escaping solution, also escape `'` as `&#39;` or consider using a DOM-based approach (`el.textContent = val; return el.innerHTML`).

### `String(str)` coercion in utility functions
**Severity:** Low
**Lines:** 2143, 2146
Both `escapeHtml` and `escapeQuotes` begin with `String(str)` to coerce the input. This means passing `null` or `undefined` produces `'null'` or `'undefined'` as strings rather than empty strings, which may be unexpected.
**Action:** Consider `String(str ?? '')` to return an empty string for null/undefined inputs.

## Summary
The utilities section implements the security primitives for the entire file, so correctness here is critical. The incomplete `escapeHtml` and mixed-context `escapeQuotes` (detailed in security) are the most important issues. The pattern issues of magic numbers and className string assignment are secondary but worth addressing.
