# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` in onclick — wrong escaping function creates broken onclick handler
**Severity:** High
**Lines:** 2029
The intent is to safely embed a JSON object into an `onclick` attribute. However, `escapeHtml` converts `"` to `&quot;`, which produces a string like `addToken({&quot;name&quot;:&quot;1/1 Soldier&quot;,...})`. When the browser parses this as JavaScript in the event handler, it receives an invalid expression and the call fails. Beyond the functional bug, this also means the actual XSS-prevention goal (preventing injection through token names) is not properly addressed — `escapeHtml` applied to JSON changes double quotes but not single quotes, leaving potential injection via token `name` fields that contain `'`.
**Action:** Replace `escapeHtml(JSON.stringify(t))` with the index approach: `onclick="addToken(COMMON_TOKENS[${i}])"`. Since `COMMON_TOKENS` is a compile-time constant array, passing the index avoids all serialization and injection concerns entirely. This is the safest fix.

### Custom token inputs (`name`, `power`, `toughness`) are passed to `addToken` without HTML escaping
**Severity:** High
**Lines:** 1850–1855
User-entered values from the custom token form (`custom-token-name`, `custom-token-power`, `custom-token-tough`) are stored directly as string values in the token object. These values are later rendered into innerHTML in `bfCardHTML` (lines 1897–1899) without escaping. An attacker could enter `<img src=x onerror=alert(1)>` as a custom token name.
**Action:** Strip HTML from user input at the point of entry in `addCustomToken`, or ensure all rendering paths apply `escapeHtml()`. The rendering fix in `bfCardHTML` (also flagged in the Render Play Area review) is the correct place to enforce this, but defense in depth would also sanitize at input time.

### `COMMON_TOKENS` data embedded in onclick attribute via JSON — data integrity
**Severity:** Medium
**Lines:** 2029
Even if the escaping were correct (using `escapeQuotes`), embedding full JSON objects into onclick attributes is brittle: any special character in any token field (e.g. `'` in a name like `Kor Spirit`) would break the attribute boundary. The index-based approach (`COMMON_TOKENS[i]`) completely avoids this class of issue.
**Action:** Use `onclick="addToken(COMMON_TOKENS[${i}])"` as the safe canonical approach.

## Summary
Two high-severity issues: the `escapeHtml(JSON.stringify(t))` pattern is both functionally broken and an incomplete XSS mitigation, and custom token user input is rendered unescaped into innerHTML. The index-based onclick pattern for presets and escaping at render time are the required fixes.
