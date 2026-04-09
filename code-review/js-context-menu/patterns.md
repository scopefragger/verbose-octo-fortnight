# Patterns Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for context menu boundary padding
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are hardcoded magic numbers representing the approximate dimensions of the context menu. If the menu's CSS size changes, these numbers must be updated manually.
**Action:** Define `const CTX_MENU_WIDTH = 160` and `const CTX_MENU_HEIGHT = 180` or read the menu's actual rendered dimensions with `menu.offsetWidth` / `menu.offsetHeight`.

### `style.display = 'block'` / `style.display = 'none'` instead of class toggling
**Severity:** Low
**Lines:** 2001, 2009, 2020
The context menu visibility is managed via `style.display` assignments rather than CSS class toggling. Other modals in the file use `.classList.remove('hidden')` / `.classList.add('hidden')`. This inconsistency means the context menu cannot be styled via CSS class transitions.
**Action:** Add a `.hidden` class to the menu's initial state and use `classList.remove('hidden')` / `classList.add('hidden')` for consistency with the rest of the file.

### Action strings `'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'` are undocumented constants
**Severity:** Low
**Lines:** 2011–2015
The action string values used in `ctxAction` (e.g. `'tap'`, `'hand'`) must match the values used in the context menu HTML buttons' `onclick` attributes elsewhere in the file. These strings are an implicit interface contract with no shared constant.
**Action:** Define `const CTX_ACTIONS = { TAP: 'tap', HAND: 'hand', TOP: 'top', GRAVE: 'grave', EXILE: 'exile' }` and use in both the HTML buttons and `ctxAction`.

## Summary
The context menu section uses `style.display` for visibility (inconsistent with the class-based pattern elsewhere), magic numbers for boundary calculation, and undocumented action string constants. All are minor pattern issues with no functional impact.
