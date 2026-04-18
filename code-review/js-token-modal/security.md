# Security Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` in onclick is fragile
**Severity:** Medium
**Lines:** 2029
```js
onclick="addToken(${escapeHtml(JSON.stringify(t))})"
```
This works because HTML attribute values undergo entity decoding before JS evaluation — `&quot;` becomes `"` and the JSON is correctly reconstructed. However, the pattern is subtle and fragile:
- It only works because the onclick attribute uses double quotes as the delimiter and `escapeHtml` converts `"` → `&quot;`.
- If `COMMON_TOKENS` data ever includes `</script>`, `-->`, or other injection-breaking sequences in text fields (e.g., from a future API-populated source), entity encoding may not be sufficient to prevent injection.
- The COMMON_TOKENS data is currently static/hardcoded, limiting real XSS risk.

**Action:** Replace with the safe index-based pattern: `onclick="addToken(COMMON_TOKENS[${i}])"`. This eliminates all JSON-embedding concerns and is the established pattern elsewhere in the file (`onclick="selectBFCard(${idStr})"` where idStr is a simple value).

## Summary
One medium-severity concern: the `escapeHtml(JSON.stringify(t))` pattern works correctly for static hardcoded data, but is a fragile and unusual pattern that would become an XSS risk if the token data source ever changed to user-supplied or API-driven content. Replacing with an index reference is safer and simpler.
