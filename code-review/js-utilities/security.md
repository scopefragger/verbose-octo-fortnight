# Security Review — JS Utilities
Lines: 2141–2156 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` provides insufficient protection for `onclick` injection
**Severity:** High
**Lines:** 2145–2147
`escapeQuotes` is used throughout the file to sanitise data embedded as JS string arguments inside `onclick="fn('${escapeQuotes(value)}')"` attributes. The function backslash-escapes `'` but does NOT escape backslash itself (`\`). An attacker-controlled value containing `\` followed by `'` (i.e. the two-character sequence `\'`) will produce `\\'` — the backslash is consumed by the first replacement, leaving the quote unescaped. This allows the string literal to be broken out of, enabling arbitrary JavaScript injection via innerHTML-based rendering of API responses (deck names, commander names).

Example exploit: a deck name stored as `x\', alert(1), '` renders as `onclick="deleteSavedDeck('id', 'x\', alert(1), '')"` which executes `alert(1)`.
**Action:** Fix `escapeQuotes` to escape `\` *before* escaping `'`:
```js
function escapeForJsString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
```
Audit every `escapeQuotes` call-site to ensure this corrected function is used instead.

### `escapeHtml` applied to `JSON.stringify` in `onclick` — wrong tool for the context (line 2029)
**Severity:** Medium
**Lines:** 2029 (caller, outside this segment but directly dependent on `escapeHtml`)
At line 2029, `escapeHtml(JSON.stringify(t))` is used to embed a JSON object as a JS argument inside an `onclick` attribute. `escapeHtml` converts `<`, `>`, and `&` to entities — it does NOT escape quotes. A token object whose `name` or other property contains `"` will break out of the surrounding JS argument, enabling XSS. The correct approach for this pattern is to use `JSON.stringify` and then encode the result as a `data-*` attribute parsed in the handler, or to use `encodeURIComponent`.
**Action:** Replace the `onclick` inline JSON pattern with a `data-token` attribute approach:
```html
<button class="token-preset-btn" data-token="${escapeHtml(JSON.stringify(t))}"
  onclick="addTokenFromBtn(this)">…</button>
```
And in `addTokenFromBtn(btn)` parse `JSON.parse(btn.dataset.token)`.

### `showToast` renders `msg` via `textContent` — safe
**Severity:** N/A
**Lines:** 2152
`el.textContent = msg` is used, not `innerHTML`. This is safe regardless of what `msg` contains — no XSS risk here.
**Action:** No action required. Document this as intentional to prevent future regressions (a comment like `// textContent is intentional — safe from XSS` would help).

## Summary
The most significant security issue is the incomplete backslash handling in `escapeQuotes`, which can be exploited if any user-controlled string containing `\` reaches an `onclick` attribute. This is a real attack vector given that deck names and commander names are user-supplied and persisted via the API. The unrelated `escapeHtml(JSON.stringify(...))` misuse at line 2029 is a separate XSS vector that should also be fixed.
