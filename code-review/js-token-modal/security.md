# Security Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `escapeHtml(JSON.stringify(t))` in onclick attribute is XSS risk for custom tokens
**Severity:** High
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` — while `COMMON_TOKENS` values are currently hardcoded and safe, this pattern would be catastrophically unsafe if token objects ever included user-supplied fields (e.g., a custom token name entered by the user). The HTML entity encoding from `escapeHtml` does not prevent JavaScript injection within an `onclick` attribute; it only prevents HTML tag injection. A token name like `'); alert(1); ('` would execute arbitrary JavaScript after browser HTML-decoding.
**Action:** Never serialize objects into inline onclick attributes. Use `data-index="${i}"` and read `COMMON_TOKENS[el.dataset.index]` in the event handler.

### `closeTokenModal` checks `e.target` for the modal backdrop — safe
**Severity:** Low
**Lines:** 2034–2037
The check `e.target === document.getElementById('token-modal')` compares DOM element references, which is safe. No user data is involved.
**Action:** No change needed.

## Summary
The high-severity finding is the pattern of serializing objects into onclick attributes. While `COMMON_TOKENS` is currently static and safe, the same pattern applied to any user-supplied data would create XSS. The immediate fix is to pass only the array index and look up the token in `addToken()`.
