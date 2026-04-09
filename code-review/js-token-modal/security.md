# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` used for onclick parameter — incorrect escaping approach
**Severity:** High
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` applies `escapeHtml` to a JSON-serialized object before embedding it in an HTML `onclick` attribute. This is the wrong tool for this context:
1. `escapeHtml` converts `<`, `>`, and `&` to HTML entities — these characters do not appear in typical token JSON, so the HTML injection risk is low.
2. However, `JSON.stringify` of a token object will produce a string with double quotes (`"`). An HTML attribute delimited by double quotes will be broken by the first `"` in the JSON, since `escapeHtml` does not escape `"` to `&quot;`. This means the onclick attribute will be malformed/truncated for any token object, because `JSON.stringify` always produces `"key":"value"` with double quotes.
3. The correct approach is to use `escapeQuotes` (which does convert `"` to `&quot;`) or — better — to avoid passing complex objects through onclick attributes entirely.
**Action:** Replace this pattern with a `data-token-index` attribute and a delegated event listener, or use `escapeQuotes(JSON.stringify(t))` as an intermediate fix (though this is still fragile for nested quotes).

## Summary
The `escapeHtml(JSON.stringify(t))` pattern is a high-severity security/correctness issue. `escapeHtml` does not escape double quotes, causing the generated `onclick` attribute to be malformed (broken HTML) for all tokens. The attribute will be truncated at the first `"` character in the JSON. This likely means the token modal is functionally broken for all tokens beyond simple names.
