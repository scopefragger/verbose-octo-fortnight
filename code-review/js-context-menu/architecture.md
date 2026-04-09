# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu actions duplicate focus panel actions
**Severity:** Medium
**Lines:** 2011–2015
`ctxAction` offers `tap`, `hand`, `top`, `grave`, and `exile` — the same five actions available in the focus panel. Both the context menu and focus panel call the same underlying action functions (`tapCard`, `returnToHand`, `putOnTop`, `sendToGrave`, `sendToExile`). This duplication is not a code problem per se (they call shared functions) but means the available actions in each surface must be kept in sync manually.
**Action:** Document that the context menu and focus panel share the same action vocabulary. If an action is added or removed, update both surfaces.

### Global click listener registered in the context menu section, not a setup function
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` call is at module scope within the context menu section, meaning it executes immediately at script load rather than being registered in a named setup function. This makes it invisible when reading the initialization code (e.g. an `init()` function) — developers must read through all sections to find all global listeners.
**Action:** Consider moving all global event listener registrations to a single `setupGlobalListeners()` function called at initialization.

### `showCtxMenu` sets `ctxTarget` directly on a module-level variable
**Severity:** Low
**Lines:** 1999
`showCtxMenu` sets `ctxTarget = id` as a module-level side effect. This is a shared mutable state pattern that creates a hidden dependency between `showCtxMenu`, `ctxAction`, and the dismissal listener. If two context menus were ever shown in quick succession, the first target would be overwritten.
**Action:** No immediate action needed (only one context menu exists), but document this as a limitation.

## Summary
The context menu section is functionally straightforward but shares the action surface with the focus panel (requiring manual sync), registers a global click listener at module scope rather than in a setup function, and uses module-level mutable state for the context target.
