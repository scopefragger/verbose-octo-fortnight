# Security Review — Token Modal
Lines: 733–771 | File: public/mtg-commander.html

## Findings

### XSS via `escapeHtml` misuse in preset button `onclick` attribute (adjacent JS, line 2029)
**Severity:** High
**Lines:** 2029 (JavaScript that renders into the CSS-styled `.token-preset-btn` buttons)
The CSS block itself is inert, but the buttons it styles are injected via:
```js
`<button class="token-preset-btn" onclick="addToken(${escapeHtml(JSON.stringify(t))})">`
```
`escapeHtml` converts `&`, `<`, `>`, `"`, `'` to HTML entities — correct for HTML text nodes. However, the output lands inside an `onclick` attribute value. The browser HTML-decodes attribute values before passing them to the JS parser, so the entity encoding is semantically transparent to JavaScript execution. A crafted token object (e.g., one where `COMMON_TOKENS` could be externally influenced) whose JSON contains characters like `"`, `)`, `;` would survive entity encoding and execute arbitrary JS when the button is clicked. Although `COMMON_TOKENS` is currently a hardcoded constant, the pattern is unsafe-by-design: `escapeHtml` is the wrong tool for inline event handler attribute escaping; `JSON.stringify` output should be stored in a `data-*` attribute or the handler should look up tokens by index.
**Action:** Replace the `onclick` inline approach. Assign each token an index and use `onclick="addToken(${i})"`, then look up `COMMON_TOKENS[i]` inside `addToken()`. This eliminates the need to serialize the full object into HTML markup entirely.

## Summary
The CSS rules themselves introduce no security surface. The critical issue is in the JavaScript that populates the CSS-styled preset buttons: using `escapeHtml` around `JSON.stringify` output inside an `onclick` attribute gives a false sense of safety — HTML entity encoding does not prevent JS injection inside event handler attributes. The fix is to avoid serializing data into inline handlers altogether.
