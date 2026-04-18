# Patterns Review — js-context-menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `style.display` toggling instead of CSS class
**Severity:** Low
**Lines:** 2001, 2009, 2020
Menu visibility is managed via `style.display = 'block'` / `'none'` directly. The rest of the file uses `classList.add/remove/toggle` for visibility states (e.g., `card-focus-panel` uses `.visible`). Inline display toggling prevents CSS transitions and is inconsistent with the established pattern.
**Action:** Add a `.visible` class for the context menu in CSS (`#card-ctx-menu.visible { display: block; }`) and replace all `style.display` assignments with `classList.add('visible')` / `classList.remove('visible')`.

### Hardcoded menu-offset magic numbers
**Severity:** Low
**Lines:** 2002–2003
`160` and `180` appear without explanation. A reader must consult the CSS to understand these are assumed menu dimensions.
**Action:** Add a comment (`// menu approx. width × height`) or compute dynamically from `menu.offsetWidth`/`menu.offsetHeight` after displaying.

## Summary
Two minor pattern issues: inline `style.display` toggling (inconsistent with the rest of the file's class-based visibility) and unexplained magic numbers for viewport clamping. Both are easy to fix.
