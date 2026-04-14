# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu shares `ctxTarget` state with the rest of the play module
**Severity:** Low
**Lines:** 1999, 2016
`ctxTarget` is a module-level variable modified by `showCtxMenu` and cleared by `ctxAction`. If another part of the code reads `ctxTarget` between these two calls, it would see a stale card reference. Currently nothing else reads `ctxTarget`, but as the app grows this global state is fragile.
**Action:** Consider encapsulating context menu state in an object: `const ctxMenu = { target: null }`. This makes the dependency on the context menu state explicit.

### Context menu positioning is clamped but ignores vertical scroll
**Severity:** Low
**Lines:** 2002–2005
The position clamping uses `window.innerWidth - 160` and `window.innerHeight - 180` as bounds. These constants (160, 180) are the assumed menu width and height. If `window.scrollY > 0`, `e.clientY` is relative to the viewport but `menu.style.top` is relative to the document, causing the menu to appear in the wrong position on scrollable pages.
**Action:** Add `window.scrollY` to the Y offset: `menu.style.top = (y + window.scrollY) + 'px'`. This is a bug when the page is scrollable.

### Global `click` listener is registered at module load, outside any init function
**Severity:** Low
**Lines:** 2019–2021
The `document.addEventListener('click', ...)` runs immediately when the script is parsed, before the DOM element `card-ctx-menu` is guaranteed to exist. If the script is in `<head>` without `defer`, this could cause issues. In the current file layout it's safe (script is at end of body), but it's fragile.
**Action:** Wrap the listener registration in a `DOMContentLoaded` handler or move it into an `initContextMenu()` function called at app startup.

## Summary
The context menu is functional but uses global state (`ctxTarget`) that could cause issues as the app grows. The scroll offset bug in positioning could affect usability on long pages. The global click listener registration is fragile given script placement dependencies.
