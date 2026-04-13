# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Token modal is split across `showTokenModal`, `closeTokenModal`, and `addToken`
**Severity:** Low
**Lines:** 2023–2038
The three token modal functions are logically related but `addToken` is not visible in this segment (it is defined elsewhere). The open/close/add split is reasonable, but the coupling between `showTokenModal` (which renders the presets) and `addToken` (which consumes token data) means changes to the token data shape must be reflected in both.
**Action:** No structural change needed for the current size. Ensure `addToken` is defined nearby and documented as the companion to `showTokenModal`.

### `closeTokenModal` is a click handler but named like a function
**Severity:** Low
**Lines:** 2034
`closeTokenModal(e)` takes an event object, meaning it's designed to be called as an event listener, not as a standalone close function. However, if code elsewhere wants to close the modal programmatically (without an event), calling `closeTokenModal()` with no argument would fail because `e.target` would be `undefined`.
**Action:** Separate the backdrop check from the close logic: implement a `_closeTokenModal()` internal function and have `closeTokenModal(e)` call it only when `e.target === the modal element`.

### Token modal only supports preset tokens, no custom token creation
**Severity:** Low
**Lines:** 2023–2038
The modal renders only `COMMON_TOKENS` presets with no input fields for custom tokens. This is a feature limitation, not a bug, but the current architecture makes it hard to add custom token creation.
**Action:** Document as a known limitation. If custom tokens are added later, the XSS concern in the onclick pattern (see security review) must be resolved first.

## Summary
The token modal is small and relatively self-contained. The main architectural issue is the conflation of event-listener behavior with the close function, which makes programmatic closing fragile. The security concern (see security review) is the highest priority item.
