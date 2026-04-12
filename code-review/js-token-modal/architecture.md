# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` belongs to the modal workflow but is defined 180 lines away
**Severity:** Medium
**Lines:** 1843, 2029
`addToken()` is the primary action triggered by the Token Modal, yet it is defined at line 1843 in what is effectively the Play Core / Battlefield section. The Token Modal section (2023–2038) only defines the UI-layer helpers `showTokenModal()` and `closeTokenModal()` while the actual mutation (`addToken`) lives far away.
**Action:** Move `addToken()` and `addCustomToken()` (lines 1843–1856) to directly follow `closeTokenModal()` at line 2039. This keeps the full token-modal flow (show → add → close) in one contiguous section.

### `closeTokenModal` duplicates the `hidden` class toggle logic
**Severity:** Low
**Lines:** 2031, 2036, 1846
The string `'hidden'` is toggled on `token-modal` in three separate places: `showTokenModal()` (remove), `closeTokenModal()` (add), and `addToken()` (add). There is no single function encapsulating open/close, making it easy to miss a site when changing the implementation.
**Action:** Extract a `openTokenModal()` / `closeTokenModal()` pair where `closeTokenModal()` unconditionally hides the modal (no event-target guard at this level), and call them consistently from all three sites. The overlay-click guard can be in the event handler that calls `closeTokenModal()`.

### Modal close guard is inside the close function, not the caller
**Severity:** Low
**Lines:** 2034–2037
`closeTokenModal(e)` checks `e.target === element` internally — this couples the event-delegation guard to the function itself, making the function non-reusable for programmatic close calls.
**Action:** Move the `e.target` guard to the `onclick` handler in HTML (or the addEventListener call), and make `closeTokenModal()` a pure "hide modal" function with no event parameter.

## Summary
The Token Modal's architecture is split across two distant code sections, making the full add-token flow hard to trace. The `addToken` and `addCustomToken` functions should be co-located with `showTokenModal` and `closeTokenModal`. Minor coupling issues exist around the `hidden` toggle being scattered and the event-guard being inside the close function rather than at the call site.
