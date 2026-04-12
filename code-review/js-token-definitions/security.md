# Security Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### XSS risk when COMMON_TOKENS data is serialised into an onclick attribute (consumer, line 2029)
**Severity:** High
**Lines:** 2029 (consumer of this data)
Although the data itself is a hardcoded constant, the way it is used at line 2029 is critically flawed and the risk originates from how this array's values are designed:

```js
return `<button class="token-preset-btn" onclick="addToken(${escapeHtml(JSON.stringify(t))})">${t.name}${fly}</button>`;
```

`escapeHtml()` HTML-encodes characters like `<`, `>`, `&` but **does not escape single quotes or backslashes inside a JS string context within an `onclick` attribute**. If a `name`, `type_line`, or `keywords` value were ever changed to include a single quote or a closing parenthesis (e.g. a future contributor adds `"Knight's Pledge"` as a token name), the onclick attribute would break out of the string literal and allow arbitrary JS injection.

The constant is hardcoded today and safe, but the pattern is fragile.
**Action:** Replace the inline `onclick` attribute approach with a `data-index` attribute and a delegated event listener that reads `COMMON_TOKENS[index]` directly. This eliminates serialisation/deserialisation through HTML entirely and removes the XSS vector.

### No issues with the raw data definitions
**Severity:** N/A
**Lines:** 1647–1662
The `COMMON_TOKENS` array is a pure data constant with no dynamic input. No secrets, no user-controlled data, no API calls. The definitions themselves carry no security risk.

## Summary
The token definitions data is safe in isolation. The critical security concern is in the consumer (line 2029) where `JSON.stringify` output is embedded into an `onclick` attribute and protected only by HTML-escaping, which is insufficient for a JS string context. Future edits to token names could silently introduce XSS.
