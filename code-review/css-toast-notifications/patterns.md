# Code & Pattern Review — Toast Notifications
Lines: 469–486 | File: public/mtg-commander.html

## Findings

### Magic numbers for position and spacing
**Severity:** Low
**Lines:** 472–473, 477–478
`bottom: 20px`, `right: 20px`, `padding: 10px 18px`, and `border-radius: 10px` are all bare literals. Other spacing values in the file are also literal, but grouping these toast-specific values under named variables (or at minimum a comment block) would make theme-wide adjustments easier.
**Action:** Consider defining `--spacing-md` and `--radius-md` CSS variables if the project ever moves toward a design token system. As a minimum, add a comment noting these are intentional layout constants.

### `z-index: 200` is an undocumented magic number
**Severity:** Low
**Lines:** 480
The value `200` is used without any comment explaining the stacking context. Other z-index values in the file (e.g., modals, context menus) should form a documented scale; without that, future layers may accidentally appear above or below the toast unexpectedly.
**Action:** Document the z-index scale with a comment block (e.g., `/* z-index scale: modal=300, toast=200, ctx-menu=100 */`) near the top of the CSS section or inline.

### `transition: all 0.3s` — magic duration and overly broad property
**Severity:** Low
**Lines:** 483
Also flagged in the Static review. From a pattern perspective, `0.3s` is a bare number with no named token. If the app's animation speed is ever adjusted globally, this value must be hunted down individually.
**Action:** Consider a `--transition-speed` CSS variable. Restrict `transition` to `transform` and `opacity` to make intent explicit.

### No accessibility attributes in CSS counterpart
**Severity:** Low
**Lines:** 469–486
The CSS defines two visible states (`show`, `error`) but there is no `aria-live` region or `role="alert"` referenced or implied. The HTML element at line 1029 should carry `role="status"` (for default toasts) or `role="alert"` (for errors) so screen readers announce the message. This is a CSS-adjacent pattern concern since the CSS is driving visibility.
**Action:** Add `role="status"` to the `#toast` element in the HTML, and consider toggling to `role="alert"` dynamically for error toasts in `showToast()`.

## Summary
The toast CSS is concise and functional but relies on several undocumented magic numbers (position offsets, z-index, animation duration) and uses `transition: all` where explicit property targeting would be cleaner. Accessibility affordances (ARIA roles) are absent, which is the most impactful pattern gap given that toasts are a primary user feedback surface.
