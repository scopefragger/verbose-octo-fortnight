# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Token modal has no "add custom token" capability
**Severity:** Low
**Lines:** 2023–2038
The modal only shows preset tokens from `COMMON_TOKENS`. There are no input fields for users to define a custom token (name, P/T, type, color). This is a UX gap — many EDH games create tokens not on the preset list.
**Action:** Add a "Custom Token" form section to the modal with inputs for name, power, toughness, type, and color checkboxes, wired to a `createCustomToken()` function.

### `closeTokenModal` depends on event target identity for close logic
**Severity:** Low
**Lines:** 2034–2037
The close-on-backdrop-click pattern requires the modal's `onclick` attribute to call `closeTokenModal(event)`. This is a common pattern but means the close logic is split across the HTML template and the JS function, making it harder to reason about modal lifecycle.
**Action:** Consider a unified `initModal(id)` helper that attaches the backdrop click handler, or simply check `classList.contains('modal')` on the clicked element.

### Modal state (open/closed) managed entirely through CSS class
**Severity:** Low
**Lines:** 2031, 2036
The token modal uses `classList.remove('hidden')` to open and `classList.add('hidden')` to close. There is no JS variable tracking whether the modal is open. This makes it impossible to check modal state programmatically without querying the DOM.
**Action:** Maintain `let tokenModalOpen = false` and update it on open/close, or use a generic modal manager that tracks open modals.

## Summary
The token modal is minimal and functional. The main architectural gaps are the lack of custom token creation and the absence of a JS-level open/closed state variable. The close-on-backdrop pattern works but depends on careful HTML attribute wiring.
