# Code & Pattern Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Magic numbers for menu boundary clamping
**Severity:** Low
**Lines:** 2002–2003
`window.innerWidth - 160` and `window.innerHeight - 180` are hardcoded pixel offsets representing the approximate rendered size of the context menu. These will silently become wrong if the menu's CSS dimensions change.
**Action:** Query the actual menu dimensions after display: `const { width, height } = menu.getBoundingClientRect();` then use `window.innerWidth - width` and `window.innerHeight - height`.

### `style.display = 'block'` / `style.display = 'none'` pattern
**Severity:** Low
**Lines:** 2001, 2009
The menu is shown/hidden via inline `style.display` manipulation rather than a CSS class toggle. This is inconsistent with how other modals (e.g., `token-modal`) use class-based show/hide.
**Action:** Add a `.visible` or remove a `.hidden` class rather than setting `style.display` directly, consistent with the rest of the codebase.

### Action strings are magic string constants
**Severity:** Low
**Lines:** 2011–2015
The action strings `'tap'`, `'hand'`, `'top'`, `'grave'`, `'exile'` are used in both the HTML markup (in `onclick` attributes) and the JS `if` conditions. A typo in either location causes a silent no-op.
**Action:** Define an `CTX_ACTIONS` constant object and reference it in both the HTML template and the JS handler.

## Summary
Minor pattern issues throughout, primarily magic numbers and inconsistent show/hide patterns. The action strings being magic constants shared between HTML and JS is the most fragile aspect — a rename requires updating both locations.
