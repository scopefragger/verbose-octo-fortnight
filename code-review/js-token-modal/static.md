# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused `i` index variable in `map` callback
**Severity:** Low
**Lines:** 2026
The `COMMON_TOKENS.map((t, i) => {...})` callback declares `i` but never uses it.
**Action:** Remove the unused `i` parameter: `COMMON_TOKENS.map(t => {...})`.

### `closeTokenModal` only closes if click target is the overlay itself
**Severity:** Low (by design)
**Lines:** 2034–2038
`closeTokenModal` checks `e.target === document.getElementById('token-modal')` to implement click-outside-to-close. This is correct but the `getElementById` call inside an event handler is a minor inefficiency (called on every outside-click event on the overlay).
**Action:** Cache the modal element reference at the top of `closeTokenModal` or at module level.

### `showTokenModal` rebuilds `token-presets` innerHTML every time it is opened
**Severity:** Low
**Lines:** 2025–2030
`COMMON_TOKENS` is a constant array. Rebuilding the innerHTML from scratch every time the modal opens is wasteful. The HTML is always identical.
**Action:** Populate `token-presets` once (e.g., during init or on first open), and only toggle visibility thereafter.

## Summary
The token modal is a short and focused section. The main issues are a minor performance concern (rebuilding constant HTML on every open) and an unused loop variable. No logic bugs were found.
