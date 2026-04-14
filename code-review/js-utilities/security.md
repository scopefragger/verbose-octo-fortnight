# Security Review — Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeHtml` is incomplete for attribute-context XSS prevention
**Severity:** High
**Lines:** 2142–2144
`escapeHtml` encodes only `&`, `<`, and `>`. It does not encode `"` or `'`. The OWASP XSS prevention rule for HTML attributes requires escaping all non-alphanumeric characters as HTML entities, or at minimum encoding both quote characters.

While the codebase's CLAUDE.md states "always wrap user-supplied data in `esc()` before interpolating into HTML strings", the actual `escapeHtml` function does not fully implement XSS prevention for attribute contexts. Any code path that calls `escapeHtml` and injects the result into an HTML attribute value delimited by single or double quotes may be exploitable if the input contains the corresponding quote character.

In the mtg-commander.html file, `escapeHtml` is used in `alt="..."` attributes (safe, no injection) and in body content (safe). The risk increases if it is ever used in `onclick` or `href` attributes.
**Action:** Add `'` → `&#39;` and `"` → `&quot;` to `escapeHtml` to make it safe for all HTML contexts. The enhanced function should be:
```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### `escapeQuotes` backslash-escaping is insufficient for HTML attribute context
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` is used to embed strings in `onclick` attributes like `onclick="fn('${escapeQuotes(name)}')"`. The backslash escaping (`\'`) works when the JS engine processes the string, but the HTML parser sees `\'` as a literal backslash and single quote — not as an escaped quote. This means a card name containing `'` could terminate the JS string argument and inject arbitrary JS code.

Example: if `card.name = "O'Brien"`, `escapeQuotes` produces `"O\'Brien"`, and the onclick becomes `onclick="fn('O\'Brien')"`. The HTML parser reads this as attribute content `fn('O\` + `Brien')` which may or may not parse correctly depending on the browser. Modern browsers typically handle this, but it is technically undefined behavior.
**Action:** Replace all `onclick="fn('${escapeQuotes(value)}')"` patterns with `onclick="fn(${JSON.stringify(value)})"`. `JSON.stringify` produces a properly double-quoted JS string (`"O'Brien"`) that is safe in an HTML attribute context.

### `showToast` sets `el.textContent` — safe
**Severity:** Low
**Lines:** 2152
`el.textContent = msg` correctly uses textContent (not innerHTML) for the toast message. This is safe regardless of message content.
**Action:** No action needed.

## Summary
The two utility escaping functions have significant security gaps. `escapeHtml` does not escape quotes (Medium risk for attribute contexts), and `escapeQuotes` uses non-standard backslash escaping that is not reliable in HTML attribute context (High risk for onclick injection). These functions are the foundation of XSS prevention across the entire file — fixing them is the highest-priority security action in the codebase.
