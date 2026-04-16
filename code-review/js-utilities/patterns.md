# Patterns Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` missing a JSDoc/comment explaining its safe usage context
**Severity:** Low
**Lines:** 2142–2144
The function has no comment indicating it is safe for text nodes only (not attribute values). Callers across the file use it in both contexts, creating a false sense of safety.
**Action:** Add a comment above the function:
```js
// Safe for HTML text node content only.
// Does NOT escape quotes — do not use inside attribute values.
// Use escapeAttr() for attribute contexts.
```

### `escapeQuotes` has no comment warning of its limitations
**Severity:** Medium
**Lines:** 2145–2147
The function name `escapeQuotes` suggests it is a general-purpose quote-escaping utility, but it uses a mixed HTML/JS escaping strategy that is incorrect for both contexts. There is no warning comment, so callers assume it is safe to use in `onclick` attributes.
**Action:** Add a prominent warning:
```js
// WARNING: This function uses incorrect mixed HTML/JS escaping and is NOT safe
// for use in onclick attributes. Do not use for new code. Prefer data-* attributes
// with addEventListener instead.
```

### Toast auto-hide duration `3000` ms is a magic number
**Severity:** Low
**Lines:** 2155
`setTimeout(() => { el.className = 'toast'; }, 3000)` uses a bare `3000` ms (3 seconds) with no named constant.
**Action:** Define `const TOAST_DURATION_MS = 3000;` and use it here.

### `showToast` builds class string via concatenation instead of `classList`
**Severity:** Low
**Lines:** 2153
`el.className = 'toast show' + (isError ? ' error' : '')` manually constructs a class string. This overwrites all existing classes and is brittle if the element gains additional classes elsewhere.
**Action:** Use `classList` instead:
```js
el.className = 'toast'; // reset
el.classList.add('show');
if (isError) el.classList.add('error');
```

### Utility functions defined at end of file — inconsistent with "define before use" convention
**Severity:** Low
**Lines:** 2141–2156
In a file of ~2159 lines, defining shared utilities at the very end means they appear after hundreds of call sites. While JavaScript hoists `function` declarations, the placement is counterintuitive for a file read top-to-bottom.
**Action:** Move the utilities block to immediately after the state declarations (around line 1640) so readers encounter the utility contracts before the code that uses them.

### `escapeHtml` regex chain could miss edge cases — no unit tests
**Severity:** Low
**Lines:** 2143
The three-step regex replacement (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`) is standard but has no test coverage. The `&` must be replaced first to avoid double-escaping; a future maintainer swapping the order would introduce a bug.
**Action:** Add a comment noting that `&` must be replaced first: `// Order matters: & must be first to prevent double-escaping`.

## Summary
The utilities section lacks defensive comments on both escaping functions, creating the conditions for their misuse across the file. The toast duration magic number and class-string concatenation are minor issues. The most impactful action is adding clear warning comments to `escapeHtml` and `escapeQuotes` and introducing an `escapeAttr` function to fill the missing gap in the escape toolkit.
