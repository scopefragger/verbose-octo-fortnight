# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` used as an `onclick` argument — incorrect escaping strategy
**Severity:** High
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` passes a JSON-stringified token object as an inline JS argument. `escapeHtml` converts HTML special characters (`<`, `>`, `"`, `&`) to HTML entities. However, the argument is being placed inside a JavaScript `onclick` attribute, not raw HTML content.

The result is that `"` becomes `&quot;` in the attribute value, which HTML-decodes correctly when the browser parses the attribute, but this is accidental correctness rather than intentional — and it breaks down for cases where the JSON contains characters like `'`, `` ` ``, or `\` that `escapeHtml` does not escape. More critically, if any `COMMON_TOKENS` entry ever contains a string with a single quote or backtick, the `onclick` will be syntactically malformed or exploitable.

Since `COMMON_TOKENS` is a hardcoded constant, there is no immediate XSS risk, but the pattern is wrong and dangerous if `COMMON_TOKENS` ever gains dynamic entries (e.g. user-defined custom tokens in the future).

**Action:** Do not embed JSON objects as raw `onclick` arguments. Instead, assign each preset token a numeric index and call `addToken(COMMON_TOKENS[${i}])` by index. Alternatively, store the token data in a `data-token-index` attribute and attach the event listener via `addEventListener`, entirely avoiding inline script injection.

### `t.name` rendered unescaped into button text content
**Severity:** Low
**Lines:** 2029
The button label `${t.name}${fly}` is interpolated directly into innerHTML without escaping. Since `COMMON_TOKENS` is a hardcoded constant, there is no immediate XSS risk, but if token names are ever sourced from user input or an external API, this becomes a vulnerability.
**Action:** Use `escapeHtml(t.name)` in the button label to make the pattern safe by default: `` `${escapeHtml(t.name)}${fly}` ``.

### `COMMON_TOKENS` is a hardcoded constant — no user data flows in
**Severity:** Low
**Lines:** 2026
The token preset data comes entirely from a hardcoded constant defined at line 1647, not from user input or external APIs. This limits the current XSS exposure but the pattern (embedding raw objects in onclick) is unsafe for any future data sources.
**Action:** No immediate action for the constant data itself, but fix the embedding pattern as described above to prevent future regressions.

## Summary
The critical issue is the use of `escapeHtml(JSON.stringify(t))` to embed a token object as an inline `onclick` argument. This is the wrong escaping function for a JavaScript context and creates a fragile pattern that will break or become exploitable if `COMMON_TOKENS` entries ever contain quotes or special characters. The fix is to reference tokens by index rather than embedding their data directly in the attribute.
