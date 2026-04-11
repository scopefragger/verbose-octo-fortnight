# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Global `click` listener registered at module execution time — not in an init function
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` call is a top-level statement executed when the script loads, not inside an `init()` or `DOMContentLoaded` handler. This works in practice but is inconsistent with the rest of the codebase where side effects are typically deferred.
**Action:** Move the listener registration into the existing init function (or `DOMContentLoaded` block) for consistency.

### Context menu overlaps responsibility with `ctxAction` for state cleanup
**Severity:** Low
**Lines:** 2009, 2016, 2019–2021
State cleanup (`ctxTarget = null`, hiding the menu) is split across `ctxAction()` (lines 2009, 2016) and the global click listener (line 2020). This means the two code paths for "closing the menu" have slightly different cleanup behaviour (only `ctxAction` clears `ctxTarget`).
**Action:** Extract a `hideCtxMenu()` function that both `ctxAction` and the document click listener call, ensuring consistent cleanup.

### Action dispatch duplicates the same actions available in the focus panel
**Severity:** Low
**Lines:** 2011–2015
The context menu dispatches the same set of card actions (`tap`, `returnToHand`, `putOnTop`, `sendToGrave`, `sendToExile`) that the card focus panel also exposes. These two UIs surface the same functionality through different interaction patterns, which is fine, but if a new action is added, both the context menu and the focus panel must be updated.
**Action:** Consider a shared `executeCardAction(id, action)` function that both the context menu and focus panel buttons call, centralising the action dispatch.

## Summary
The context menu is compact and readable. The main architectural concern is the asymmetric cleanup between `ctxAction` and the document click listener; extracting a `hideCtxMenu()` helper would fix this. The top-level listener registration is a minor consistency issue.
