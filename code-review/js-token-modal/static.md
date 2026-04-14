# Static Code Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `closeTokenModal` only closes when clicking the backdrop, not the element itself
**Severity:** Low
**Lines:** 2034–2037
`closeTokenModal` checks `if (e.target === document.getElementById('token-modal'))`. This only closes the modal when clicking the exact backdrop element. If the function is called from a close button's `onclick`, it would need to pass a synthetic event, which is cumbersome.
**Action:** Add a separate `forceCloseTokenModal()` function that closes without a target check, for use by close buttons. Or use `e.currentTarget` with proper event delegation.

### `showTokenModal` references `addToken` which is expected to exist globally
**Severity:** Low
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` — `addToken` must exist as a global function. If `addToken` is renamed or not yet defined when the HTML is generated, clicks silently fail.
**Action:** Verify `addToken` is defined in scope and add a reference comment. Consider using `data-*` attributes with a delegated event listener instead of inline onclick.

### Unused variable `i` in `.map((t, i) => ...)` callback
**Severity:** Low
**Lines:** 2026
The `.map((t, i) => { ... })` callback accepts `i` (the index) but never uses it. This is dead parameter.
**Action:** Change to `.map(t => { ... })` to remove the unused parameter.

## Summary
The token modal is minimal and mostly correct. The main issues are an unused map index variable and the close-modal pattern that only handles backdrop clicks, which could create friction if a dedicated close button is added later.
