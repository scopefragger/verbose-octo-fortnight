# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### XSS via `escapeHtml(JSON.stringify(t))` in `onclick` attribute
**Severity:** High
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` — `t` is a token object from `COMMON_TOKENS`, which is a static developer-controlled array. `JSON.stringify(t)` produces a JSON string like `{"name":"1/1 Soldier","power":"1",...}`. `escapeHtml` encodes `<`, `>`, and `&`, but does NOT encode single quotes (`'`) in the JSON value strings. When injected into an HTML `onclick` attribute delimited by double quotes, double-quote characters in JSON strings (such as those escaped by `JSON.stringify`) are rendered as `&quot;` — safe. However the approach of passing a complex JSON object through an HTML attribute into a JS function call is fragile.

More critically: `escapeHtml` is the wrong escaping function for this context. The correct function for embedding a string in an HTML attribute that will be interpreted as JavaScript is `escapeQuotes` (which escapes single quotes). In a double-quoted HTML attribute, `JSON.stringify` output is mostly safe because it produces double-quote-escaped JSON — but `escapeHtml` converting `"` to `&quot;` would break the JSON parsing in `addToken` if the function expects a JS object literal.

**Test case:** `addToken({"name":"1/1 Soldier",...})` — the HTML attribute would be rendered as `onclick="addToken({&quot;name&quot;:&quot;1/1 Soldier&quot;,...})"`. When the browser invokes the onclick, it decodes HTML entities before evaluating the attribute as JS, so `&quot;` becomes `"` again. This means `JSON.parse` would work, but `addToken` receives this as a raw JS expression, not a parsed object — `addToken` is called with an object literal, not a JSON string.

The real XSS risk: if `COMMON_TOKENS` ever included user-editable data (e.g., custom token names), a malicious token name like `'); alert(1); //` would break out of the function call. Currently safe because the data is static.
**Action:** Replace the inline JSON approach with data attributes: give each preset button a `data-token-index` attribute and attach a delegated event listener in JS that calls `addToken(COMMON_TOKENS[idx])`. This eliminates the JSON-in-attribute problem entirely.

### `pt` variable is computed but never used
**Severity:** Low
**Lines:** 2027
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` — `pt` is computed but never referenced in the template string on line 2029. The button label only shows `t.name` and a flying indicator.
**Action:** Remove the unused `pt` computation (see also static review).

## Summary
The primary security concern is the pattern of embedding a JSON-stringified object in an HTML `onclick` attribute via `escapeHtml`. While currently safe with static data, this pattern is fragile and will become an XSS vector if token data ever includes user input. Switching to data attributes with a JS event listener is strongly recommended.
