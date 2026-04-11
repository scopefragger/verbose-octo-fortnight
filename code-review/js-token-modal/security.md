# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` used as onclick argument — incorrect escaping approach
**Severity:** High
**Lines:** 2029
`addToken(${escapeHtml(JSON.stringify(t))})` embeds a full JSON object as an inline JavaScript argument inside an `onclick` attribute. `escapeHtml()` escapes HTML entities (`<`, `>`, `&`, `"`) but is **not** the correct function for escaping values inside a JavaScript string context within an HTML attribute.

Specifically:
- `JSON.stringify(t)` produces a JSON string (e.g., `{"name":"1/1 Soldier","power":"1",...}`).
- This JSON contains double-quotes, which `escapeHtml` converts to `&quot;`. While this prevents HTML attribute injection, the resulting value is a JSON string with `&quot;` in place of `"`, which a browser will unescape to `"` before executing the onclick JavaScript — so the onclick effectively receives valid JSON. This chain happens to work in practice.
- However, the approach is fragile and confusing. If any token property contained a single quote or a closing parenthesis `)`, the onclick attribute could break.
- The correct approach for passing structured data to event handlers is `data-*` attributes or a lookup by index, not inline JSON in onclick.

**Action:** Replace the inline JSON onclick pattern with a `data-index` attribute on each button, and add a single delegated event listener that reads the index and looks up `COMMON_TOKENS[i]`:
```js
return `<button class="token-preset-btn" data-idx="${i}">${t.name}${fly}</button>`;
```
Then attach one listener: `presets.addEventListener('click', e => { const idx = e.target.dataset.idx; if (idx != null) addToken(COMMON_TOKENS[+idx]); })`.

## Summary
The `escapeHtml(JSON.stringify(t))` pattern in the onclick attribute is a high-severity concern because it uses the wrong escaping function for the context. While it accidentally works for the current token data, it is fragile and would break or produce unexpected behaviour if token names or properties contained characters like `'`, `)`, or `\`. Switching to `data-*` attributes with a delegated listener is the correct fix.
