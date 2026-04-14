# Code & Pattern Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu dimensions in position clamping
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` use assumed pixel dimensions for the context menu. These will be wrong if the menu's CSS size ever changes.
**Action:** Compute menu size dynamically using `menu.getBoundingClientRect()` after `menu.style.display = 'block'`, or define constants `CTX_MENU_WIDTH = 160` and `CTX_MENU_HEIGHT = 180` with a comment explaining they must match the CSS.

### `display: block` / `display: none` instead of CSS class
**Severity:** Low
**Lines:** 2001, 2009
The context menu visibility is controlled with `element.style.display = 'block'/'none'`. The rest of the file uses CSS class toggling (`classList.add/remove('hidden')`) for modal and panel visibility. This is inconsistent.
**Action:** Add a `hidden` class to the context menu in HTML and use `menu.classList.remove('hidden')` / `menu.classList.add('hidden')` to match the established pattern.

### Five separate `if` statements for action dispatch
**Severity:** Low
**Lines:** 2011–2015
As noted in the static review, five sequential `if` checks are less readable and efficient than a `switch` statement.
**Action:** Refactor to `switch(action) { case 'tap': ...; break; ... }` with a `default: console.warn(...)` fallback.

## Summary
The context menu has two consistency issues with the rest of the file: using `display` style instead of a `hidden` CSS class, and using chained `if` instead of `switch`. The magic-number menu dimensions are a minor maintenance risk.
