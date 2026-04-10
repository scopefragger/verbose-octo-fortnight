# Code & Pattern Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu viewport clamping
**Severity:** Low
**Lines:** 2002–2003
`160` and `180` are assumed pixel dimensions for the context menu used to keep it within the viewport. These are magic numbers with no explanation. If the menu is restyled or gains more items, these must be updated by hand.
**Action:** Replace with runtime measurement: `window.innerWidth - menu.offsetWidth` and `window.innerHeight - menu.offsetHeight`. Alternatively, define named constants with a comment explaining their origin.

### `style.display = 'block'` / `'none'` instead of class-based visibility
**Severity:** Low
**Lines:** 2001, 2009, 2020
Menu visibility is controlled by `style.display = 'block'` and `'none'` rather than toggling a CSS class. This is inconsistent with the pattern used elsewhere in the file (e.g., `classList.add('visible')` for the focus panel) and makes the visibility state invisible to CSS inspection tools.
**Action:** Add a `.ctx-menu-visible` class to the CSS and use `classList.toggle('ctx-menu-visible', show)` for consistency.

### `ctxTarget` is a global variable shared across multiple sections
**Severity:** Low
**Lines:** 1999, 2010, 2016
`ctxTarget` is declared in the Play State section but managed here. Its ownership is split between sections, which makes it harder to trace its lifecycle.
**Action:** Add a comment in the Play State section noting that `ctxTarget` is managed by the context menu section.

## Summary
The section is minimal and functional. The main pattern issues are magic numbers for menu positioning and using direct style manipulation instead of class-based visibility, which is inconsistent with the rest of the file.
