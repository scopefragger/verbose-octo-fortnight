# Static Code Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` does not escape single quotes or backticks
**Severity:** Medium
**Lines:** 2142–2144
`escapeHtml` escapes `&`, `<`, and `>` but does not escape `'` (single quote) or `` ` `` (backtick). For use in HTML text content this is sufficient, but for use in HTML attribute values (e.g., `alt="${escapeHtml(name)}"` with double-quote delimiters), it is also sufficient. However, if `escapeHtml` is ever used inside a single-quoted attribute (e.g., `alt='${escapeHtml(name)}'`), a name containing `'` would break the attribute. The current codebase uses double-quoted attributes consistently, so this is a low-priority risk.
**Action:** Add `'` → `&#39;` to `escapeHtml` for full attribute safety: `.replace(/'/g, '&#39;')`.

### `escapeQuotes` escapes `'` to `\'` — fragile in HTML onclick context
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` produces `\'` for single quotes. This is intended for use inside `onclick='...'` attributes. However, the convention in HTML is to use double-quoted attributes, so the actual risk is low. The real fragility is that `escapeQuotes` replaces `"` with `&quot;`, but the resulting string is placed inside a JavaScript string literal inside an HTML attribute — the `&quot;` entity will be HTML-decoded by the browser to `"` before the JS is parsed, which means the escaping of double quotes is effectively a no-op in a JS string context. Strings containing `"` inside onclick handlers will break the JS.
**Action:** Do not use `escapeQuotes` for HTML onclick attributes at all. Use `data-*` attributes and JS event listeners instead.

### `showToast` uses module-level `toastTimer` variable
**Severity:** Low
**Lines:** 2149–2155
`toastTimer` is a module-level `let` that persists the timer ID. This is a standard debounce pattern and is correct. No bug here, but the variable is effectively a singleton.
**Action:** No change needed.

### `formatManaCostShort` defined in the play-state section (line 1642) AND listed here
**Severity:** Low
**Lines:** 2141–2144 (segment header implies 2141–2156 contains utilities)
Looking at the file, `formatManaCostShort` appears at line 1642 (inside the play-state block) rather than here. The segment description may be inaccurate. Verify which utility functions are actually in this range.
**Action:** Confirm the actual location of `formatManaCostShort` and move it to the utilities section if misplaced.

## Summary
The most significant static finding is `escapeQuotes` producing `\'` for onclick attributes, which gives false confidence — double quotes inside JS string arguments still break. The `escapeHtml` function is complete for its documented use cases but should be extended with single-quote escaping for full attribute safety.
