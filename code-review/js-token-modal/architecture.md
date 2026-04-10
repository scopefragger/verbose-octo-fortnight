# Architecture Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `showTokenModal` re-renders preset buttons on every open
**Severity:** Low
**Lines:** 2026–2030
Every time `showTokenModal` is called, it re-generates the full HTML for all preset buttons from `COMMON_TOKENS`. Since `COMMON_TOKENS` is a static constant that never changes at runtime, this work only needs to be done once.
**Action:** Render the preset buttons once at initialisation (e.g., in the `init()` function or on DOMContentLoaded) and cache the result. `showTokenModal` only needs to toggle visibility.

### `closeTokenModal` receives an event but has no corresponding `showTokenModal` event parameter
**Severity:** Low
**Lines:** 2034–2038
`closeTokenModal(e)` is designed to be used as a click handler on the modal overlay and checks `e.target`. But `showTokenModal()` takes no parameters and is called from a button click. These two functions have asymmetric signatures. There is no centralized modal lifecycle management.
**Action:** Consider adding a `closeTokenModal()` call (without event) from a dedicated close button, and use the event-based check only for overlay backdrop clicks.

## Summary
The modal section is small. The main architectural concern is re-rendering static content on every open. Moving preset HTML generation to initialisation time would be a simple, effective improvement.
