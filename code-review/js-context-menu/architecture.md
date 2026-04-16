# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu duplicates the same set of card actions already available in the focus panel
**Severity:** Medium
**Lines:** 2011–2015
`ctxAction` dispatches to `tapCard`, `returnToHand`, `putOnTop`, `sendToGrave`, `sendToExile` — exactly the same five actions wired in `selectBFCard`'s focus-actions button set (lines 1947–1951). This is a second code path for the same operations, meaning any new card action must be added in two places.
**Action:** Extract a shared `dispatchCardAction(action, cardId)` function that both the context menu and the focus panel delegate to. The context menu and focus panel become thin callers rather than independent dispatchers.

### Global click listener registered in the middle of functional code
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` statement is a module-level side effect embedded between function definitions. This makes it easy to miss during code review and harder to reason about event listener lifecycle.
**Action:** Move all document-level event listener registrations to a dedicated `initEventListeners()` or `initUI()` function called at startup, alongside other global setup code.

### `showCtxMenu` directly mutates `ctxTarget` global — no encapsulation
**Severity:** Low
**Lines:** 1999
`ctxTarget` is a shared global used to coordinate between `showCtxMenu` and `ctxAction`. This pattern couples the two functions through ambient state rather than direct argument passing.
**Action:** Consider passing `id` through a closure or data attribute on the menu element rather than a global. For example, store `menu.dataset.targetId = id` in `showCtxMenu` and read `menu.dataset.targetId` in `ctxAction`, eliminating the need for the `ctxTarget` global entirely.

### No integration with focus panel state — context menu and focus panel can be open simultaneously
**Severity:** Low
**Lines:** 1997–2006
`showCtxMenu` does not close the focus panel or clear `selectedBFId`. If a user right-clicks a card while the focus panel is open, both are active simultaneously, potentially operating on different cards.
**Action:** Call `closeFocusPanel()` (or at minimum clear `selectedBFId`) at the start of `showCtxMenu` to ensure only one interaction mode is active at a time.

## Summary
The context menu is cleanly written but duplicates the card-action dispatch logic from the focus panel, creating a maintenance burden. Registering the global click listener inline between function definitions is an architectural smell. Eliminating the `ctxTarget` global in favour of element-level data storage would reduce coupling between the two context-menu functions.
