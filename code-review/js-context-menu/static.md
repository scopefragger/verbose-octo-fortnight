# Static Code Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Global click listener never removed — potential memory leak
**Severity:** Low
**Lines:** 2019–2021
A `document.addEventListener('click', ...)` listener is registered at module parse time and never removed. In a single-page app that never unloads, this accumulates if the script is ever re-evaluated. For a static HTML page this is not a practical concern, but it is worth noting.
**Action:** No action required for the current architecture. Document as intentional.

### `ctxTarget` not cleared if menu is dismissed without action
**Severity:** Low
**Lines:** 1999, 2016–2021
When the global click listener dismisses the menu, `ctxTarget` is not reset to `null`. If `ctxAction` is subsequently called from a stale context, it would act on the previous `ctxTarget`. However, since `ctxAction` is only called from menu button clicks, and the menu is hidden on global click, this is an edge case that is unlikely in practice.
**Action:** Reset `ctxTarget = null` in the global click listener alongside hiding the menu.

### `showCtxMenu` does not guard against `null` menu element
**Severity:** Low
**Lines:** 2000
`document.getElementById('card-ctx-menu')` is called without a null guard. If the element is absent from the DOM, `menu.style.display` will throw a TypeError.
**Action:** Add: `if (!menu) return;` after the getElementById call.

## Summary
The context menu is simple and largely correct. The main issues are a stale `ctxTarget` when dismissed via outside click and a missing null guard on the menu element.
