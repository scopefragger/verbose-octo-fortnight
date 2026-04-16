# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `style.display = 'block'` / `'none'` instead of a CSS class toggle
**Severity:** Low
**Lines:** 2001, 2009, 2020
Visibility is controlled by setting `style.display` directly. Elsewhere in the file (e.g. `card-focus-panel` uses `.classList.add('visible')`), class-based visibility toggling is the established pattern.
**Action:** Add a `.ctx-menu--visible` CSS class and use `classList.add/remove` to show/hide the context menu, consistent with the focus-panel pattern.

### Magic numbers for menu boundary clamp not defined as constants
**Severity:** Low
**Lines:** 2002–2003
`160` and `180` are pixel guesses at the menu's rendered size. There are no named constants or comments explaining these values.
**Action:** Replace with `menu.offsetWidth` and `menu.offsetHeight` for accuracy, or define `const CTX_MENU_APPROX_W = 160; const CTX_MENU_APPROX_H = 180;` with a comment explaining they approximate the menu's CSS size.

### Action string literals not defined as constants
**Severity:** Low
**Lines:** 2011–2015
The action strings `'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'` are bare string literals matched in `ctxAction`. The same strings must appear in the HTML `onclick` attributes on the context menu items. A typo in either location silently no-ops.
**Action:** Define a `CTX_ACTIONS` constant object: `const CTX_ACTIONS = { TAP: 'tap', HAND: 'hand', TOP: 'top', GRAVE: 'grave', EXILE: 'exile' };` and reference it in both the `ctxAction` dispatch and the HTML onclick attributes.

### `e.stopPropagation()` in `showCtxMenu` not commented
**Severity:** Low
**Lines:** 1998
`e.stopPropagation()` prevents the immediately-registered global click listener from hiding the menu as soon as it is shown. This is a non-obvious interaction that should be documented.
**Action:** Add a comment: `// Prevent the global click listener from immediately hiding the menu we're about to show.`

### Consistent use of `document.getElementById` — positive pattern
**Severity:** Low
**Lines:** 2000, 2009, 2020
All three references to `card-ctx-menu` use `getElementById`. This is consistent and correct for a single-instance element.
**Action:** No action required; consider caching the element in a module-level variable (e.g. `const ctxMenuEl = document.getElementById('card-ctx-menu');`) to avoid repeated DOM lookups.

## Summary
The context menu section is brief and readable but uses `style.display` toggling where class-based visibility is the established project pattern. The action strings and boundary-clamp magic numbers should be named constants to reduce the risk of silent mismatches. The `e.stopPropagation()` interaction with the global click listener deserves a comment for future maintainers.
