# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu duplicates all battlefield actions already available in the focus panel
**Severity:** Medium
**Lines:** 1996–2021, 1946–1951
The context menu provides: tap/untap, return to hand, put on top of library, send to graveyard, exile. The Card Focus Panel (lines 1946–1951) provides the same five actions. This is complete duplication of the action surface with no additional functionality. Having two entry points for the same mutations increases the maintenance surface — any change to action behaviour must be applied in two places.
**Action:** Decide whether both surfaces are needed. If the context menu is intended as a quick-access shortcut (right-click), document that intent and ensure both paths call the same underlying functions (they currently do). If it is redundant, remove it.

### `ctxTarget` is a module-level global shared between the context menu and nothing else
**Severity:** Low
**Lines:** 1555, 1999, 2010, 2016
`ctxTarget` is declared alongside the play-state globals (`playHand`, `manaPool`, etc.) but is exclusively used by the context-menu functions. It is not part of the play state per se — it is transient UI state for the context menu.
**Action:** If the context menu is retained, move `ctxTarget` declaration to be co-located with the context-menu section (e.g. as a block-scoped variable above `showCtxMenu`), or at minimum add a comment noting it belongs to the context-menu UI.

### Global `document.addEventListener` registered inline rather than in an init block
**Severity:** Low
**Lines:** 2019–2021
A side-effect-producing `addEventListener` call sits at the top level of the script, mixed with function declarations. This makes the initialisation sequence implicit — it is unclear at a glance which top-level statements register side effects vs. which merely define functions.
**Action:** Collect all global event listener registrations into a single `initEventListeners()` function called from the DOMContentLoaded handler, so initialisation is explicit and discoverable.

### `showCtxMenu` does not close the focus panel when opening the context menu
**Severity:** Low
**Lines:** 1997–2006
If a card is selected in the focus panel and then the context menu is opened on a different card (once a trigger is wired), both the focus panel and context menu would be simultaneously visible, potentially acting on different cards. The two selection states (`selectedBFId` and `ctxTarget`) could refer to different cards.
**Action:** Call `closeFocusPanel()` at the start of `showCtxMenu()` to ensure only one card interaction surface is active at a time.

## Summary
The context menu is architecturally redundant — it duplicates the focus panel's action set with no additional capability. The dead-code status (no call site) makes this doubly concerning: it is both untested and functionally identical to existing UI. The section should either be wired and documented as a keyboard/right-click shortcut, or removed.
