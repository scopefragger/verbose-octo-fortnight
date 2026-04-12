# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu actions duplicate the focus-panel action buttons
**Severity:** Medium
**Lines:** 2011–2015 (context menu) vs 1947–1951 (focus panel)
Both the context menu (`ctxAction`) and the focus panel (lines 1947–1951) wire up the same five card actions: tap, return to hand, put on top, send to graveyard, exile. This is full duplication of intent. Any new card action must be added in two places.
**Action:** Extract a single `performCardAction(id, action)` function that both the focus panel and context menu delegate to. `ctxAction` becomes a thin wrapper: hide menu, call `performCardAction(ctxTarget, action)`.

### Global mutable state `ctxTarget` is a shared side-effect
**Severity:** Medium
**Lines:** 1555, 1999, 2010, 2016
`ctxTarget` is a module-level variable mutated by `showCtxMenu` and cleared by `ctxAction`. This creates an implicit temporal coupling: the menu must be shown before `ctxAction` is safe to call. Because `ctxTarget` is global, any part of the codebase can inadvertently read or write it.
**Action:** Consider passing the target id directly to `ctxAction` as a closure at the time the menu is shown, eliminating the need for the global variable. For example, store a closure reference on the menu element rather than a global string.

### Global click listener registered at parse time, not in an init function
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` call is at the top level of the script, not inside an `init()` or `DOMContentLoaded` handler. While this works for a single-file app, it is inconsistent with better-scoped event registration and makes the dependency on the `card-ctx-menu` DOM element implicit.
**Action:** Move this listener into an initialisation function called after the DOM is ready, alongside other setup logic.

## Summary
The context menu segment works in isolation but has architectural duplication with the focus panel and relies on a shared mutable global that couples menu display to action dispatch. Centralising card actions and eliminating the global would significantly reduce fragility.
