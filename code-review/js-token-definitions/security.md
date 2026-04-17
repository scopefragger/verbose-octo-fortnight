# Security Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Token data serialised into `onclick` attribute without safe escaping at consumption site
**Severity:** High
**Lines:** 1647–1662 (definition); 2029 (consumption)
At line 2029, token objects from `COMMON_TOKENS` are serialised with `JSON.stringify(t)` and passed directly into an `onclick` attribute: `onclick="addToken(${escapeHtml(JSON.stringify(t))})"`. `escapeHtml` converts `<`, `>`, `&`, and `"` to HTML entities, but it does not escape single quotes or JavaScript-significant characters. The JSON output contains values like `"Token Creature — Soldier"` which include double-quotes; once wrapped by `escapeHtml` (which turns `"` to `&quot;`), the resulting attribute string may be syntactically valid HTML, but if any token name or type line ever contains a single quote or backslash, the inline JS could break or be exploited.
**Action:** At the consumption site, use `escapeQuotes` (already defined in the project) on the JSON-serialised token, or store token data in a `data-` attribute and parse it in a non-inline handler to avoid all inline-JS injection risk.

### Token names and type lines are hard-coded — low risk for current data
**Severity:** Low
**Lines:** 1648–1661
All values in `COMMON_TOKENS` are static string literals authored in source code, so there is no external-input XSS vector within the definition itself. The risk noted above (at the consumption site) is the only path to exploitation.
**Action:** No action needed within the definition block; harden the consumption site as described above.

## Summary
The definition array itself poses no XSS risk since all values are hard-coded constants. However, the way these values are consumed at line 2029 — serialised as JSON into an `onclick` attribute via `escapeHtml` — is fragile and could break or allow injection if any token string ever contains a single quote or backslash. The consumption site should be refactored to use `data-` attributes and a proper event handler.
