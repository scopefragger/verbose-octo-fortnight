# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Modal visibility toggled via CSS class in `showTokenModal` — but close uses same class
**Severity:** Low (informational)
**Lines:** 2031, 2036
`showTokenModal` removes the `hidden` class, and `closeTokenModal` adds it back. This is consistent with the `hidden` class approach used in the HTML (`class="token-modal-overlay hidden"`). The pattern is fine but differs from the `visible` class pattern used for the card focus panel. The file uses two different CSS visibility patterns (`hidden` toggled off vs `visible` toggled on).
**Action:** Standardise on one CSS visibility pattern throughout the file. The `hidden` class approach (used here) is more aligned with HTML semantics; the `visible` approach requires a CSS rule for each toggled element.

### `keywords?.includes('Flying')` with emoji indicator — hardcoded keyword
**Severity:** Low
**Lines:** 2028
The Flying keyword is the only one checked for an indicator (✈ emoji). Other keywords (e.g., `'Trample'`, `'Deathtouch'`) in the token data are silently ignored.
**Action:** Either extend the keyword indicator mapping for all relevant keywords, or add a comment noting that only Flying is currently indicated, with a note to extend if needed.

### Template literal generates button with complex inline onclick content
**Severity:** Medium (see Security findings)
**Lines:** 2029
The `onclick="addToken(${escapeHtml(JSON.stringify(t))})"` pattern is the wrong tool for passing structured data; see the Security review for full details. From a patterns perspective, this is inconsistent with how other actions are dispatched (the context menu uses named string actions; the focus panel uses numeric IDs).
**Action:** Use `data-idx` + delegated listener as described in the Security review.

## Summary
The Token Modal section is compact and mostly follows established patterns. The most significant pattern issue is the JSON-in-onclick approach, which is unsafe and inconsistent with how other buttons in the file dispatch actions. Standardising the CSS visibility pattern (hidden vs visible) would be a secondary improvement.
