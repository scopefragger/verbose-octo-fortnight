# Patterns Review — js-utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` incompleteness is a systemic pattern violation
**Severity:** High
**Lines:** 2142–2144
The established pattern throughout the file is to call `escapeHtml()` whenever user or API data is inserted into HTML. However, `escapeHtml` does not escape `"`, creating a gap between what the pattern promises and what it delivers in attribute-value contexts. This is a pattern contract violation: developers trust `escapeHtml` to make data safe for HTML insertion, but it only partially fulfils that contract.
**Action:** Fix the function (add `"` → `&quot;`) so the pattern contract holds universally.

### `showToast` uses `el.className =` instead of `classList`
**Severity:** Low
**Lines:** 2153, 2155
`el.className = 'toast show' + (isError ? ' error' : '')` and `el.className = 'toast'` set the entire class string directly. The rest of the file uses `classList.add/remove/toggle` for class manipulation. Direct `className` assignment is functionally equivalent here (the toast element only ever has these classes), but is inconsistent with the file's established pattern.
**Action:** `el.classList.add('show'); if (isError) el.classList.add('error');` / `el.classList.remove('show', 'error');`.

### `escapeQuotes` context is undocumented
**Severity:** Low
**Lines:** 2145–2147
The unusual mixed JS+HTML encoding in `escapeQuotes` is not explained. A developer encountering this function without context might misapply it.
**Action:** Add: `// Use only for embedding values as single-quoted JS args inside HTML onclick="func('${escapeQuotes(val)}')" attributes`.

## Summary
The highest-priority pattern finding is `escapeHtml` not escaping `"`, which undermines the file's entire HTML-escaping convention. Fixing this one-liner closes a systemic vulnerability across all ~20+ call sites simultaneously.
