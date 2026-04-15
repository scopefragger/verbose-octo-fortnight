# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu dimensions in overflow clipping
**Severity:** Low
**Lines:** 2002–2003
`160` and `180` are hardcoded pixel values representing the assumed context menu width and height. These should either be named constants or computed dynamically from the element's rendered size.
**Action:** Replace with named constants at the top of the section: `const CTX_MENU_WIDTH = 160; const CTX_MENU_HEIGHT = 180;` with a comment noting they match the CSS dimensions.

### Series of `if` statements instead of a `switch` or lookup table
**Severity:** Low
**Lines:** 2011–2015
Five sequential `if` statements test the same `action` variable. Modern JS convention favors `switch` or an object dispatch map for this pattern.
**Action:** Use a `switch(action)` or object dispatch: `{ tap: tapCard, hand: returnToHand, top: putOnTop, grave: sendToGrave, exile: sendToExile }[action]?.(ctxTarget);`.

### `e.stopPropagation()` in `showCtxMenu` is necessary but not commented
**Severity:** Low
**Lines:** 1998
`e.stopPropagation()` prevents the global `click` listener (line 2019) from immediately hiding the menu when the right-click menu is triggered. This is a critical behavior dependency between two event handlers, but there is no comment explaining why `stopPropagation` is needed.
**Action:** Add a comment: `// Prevent the global click listener from immediately hiding this menu`.

### DOM lookup `getElementById('card-ctx-menu')` repeated in multiple functions
**Severity:** Low
**Lines:** 2000, 2009, 2021
The context menu element is looked up three times via `getElementById`. For a small static DOM, this is not a performance concern, but it could be cached in a module-level variable.
**Action:** Cache the reference: `const ctxMenuEl = document.getElementById('card-ctx-menu');` and use `ctxMenuEl` in all three locations.

## Summary
Pattern issues are minor: magic dimension constants, repeated DOM lookups, and the `stopPropagation` dependency without a comment. Replacing the `if` chain with a dispatch object would improve readability and extensibility.
