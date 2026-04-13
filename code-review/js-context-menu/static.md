# Static Code Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` is not cleared if the action functions throw
**Severity:** Low
**Lines:** 2008–2017
`ctxTarget = null` is set at the end of `ctxAction`. If any of the action functions (`tapCard`, `returnToHand`, `putOnTop`, `sendToGrave`, `sendToExile`) throw an unhandled exception, `ctxTarget` will retain its stale value. A subsequent `ctxAction` call could attempt to act on a stale target.
**Action:** Set `ctxTarget = null` at the start of `ctxAction` (after copying to a local variable) so it is always cleared regardless of whether the action throws.

### Context menu offsets use magic numbers `160` and `180`
**Severity:** Low
**Lines:** 2002–2003
`Math.min(e.clientX, window.innerWidth - 160)` and `Math.min(e.clientY, window.innerHeight - 180)` use hardcoded pixel values that represent the approximate menu dimensions. If the menu size changes in CSS, these numbers become inaccurate.
**Action:** Compute the menu dimensions dynamically: `const rect = menu.getBoundingClientRect(); const x = Math.min(e.clientX, window.innerWidth - rect.width);` — called after the menu is made visible.

### Global `click` listener closes menu on any click, including inside the menu
**Severity:** Low
**Lines:** 2019–2021
The global `document.addEventListener('click', ...)` fires before `ctxAction`'s inline `onclick` handlers due to event bubbling order. Depending on the event flow, this could cause the menu to hide before the action is dispatched.
**Action:** Verify that `ctxAction` is called before the global click handler dismisses the menu. If event order is not guaranteed, use `e.stopPropagation()` in the menu item click handlers instead.

## Summary
The context menu implementation is simple and functional. The main issues are a stale `ctxTarget` risk if actions throw, and magic numbers for positioning that will drift if the menu's CSS dimensions change.
