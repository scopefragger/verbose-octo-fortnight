# Security Review — Token Modal
Lines: 982–999 | File: public/mtg-commander.html

## Findings

### XSS Risk in addCustomToken() User Input
**Severity:** Medium
**Lines:** 987 (calls addCustomToken), 1850–1855 (implementation)

The `addCustomToken()` function retrieves user input from `#custom-token-name` and passes it directly to `addToken()` without escaping. While the token name is later rendered with `escapeHtml()` in `bfCardHTML()` (line 1897), the data flows through `playBattlefield` without sanitization at the entry point.

**Action:** Sanitize user input in `addCustomToken()` before adding to the token. Apply `escapeHtml()` to name, power, and toughness fields:
```js
const name = escapeHtml(document.getElementById('custom-token-name').value.trim());
const power = document.getElementById('custom-token-power').value.trim();
const toughness = document.getElementById('custom-token-tough').value.trim();
// Then escape power and toughness if they're rendered
```

### Event Handler onclick Attribute Vulnerability
**Severity:** Low
**Lines:** 994–998 (Card Context Menu)

The `ctxAction()` calls pass hardcoded strings ('tap', 'hand', 'top', 'grave', 'exile'), which are safe. However, this is inconsistent with the bot/API security in CLAUDE.md which mentions always wrapping user-supplied data with `esc()` in onclick attributes.

**Action:** While these specific onclick handlers are safe, ensure consistent escaping patterns across all onclick handlers. This is more of a style guide issue than a security bug.

### No Input Validation on Power/Toughness
**Severity:** Low
**Lines:** 976–977, 1852–1853

The power and toughness inputs accept any text without validation. Values like "abc" or "999" could be stored, and rendering relies on the assumption that these are numeric.

**Action:** Add type="number" to power and toughness inputs, or validate in `addCustomToken()`:
```html
<input id="custom-token-power" type="number" placeholder="Power" style="max-width:80px" />
```

## Summary

The security posture is reasonable due to existing `escapeHtml()` calls during rendering, but input sanitization should occur at the entry point rather than relying on downstream escaping. Power/toughness inputs should be constrained to numeric values.
