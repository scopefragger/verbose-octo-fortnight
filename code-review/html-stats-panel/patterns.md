# Patterns Review — Stats Panel
Lines: 847–873 | File: public/mtg-commander.html

## Findings

### Inline styles for layout constraints
**Severity:** Low
**Lines:** 848, 863, 867
Three inline `style` attributes carry presentational values:
- Line 848: `text-align:center;color:var(--text-dim);padding:30px;font-size:0.85rem`
- Line 863: `max-width:150px`
- Line 867: `max-width:180px`

The empty-state style on line 848 is particularly dense — five declarations that describe a reusable empty-state pattern used elsewhere in the app. The `max-width` values on lines 863 and 867 are magic numbers with no named token to explain why 150 px and 180 px were chosen.
**Action:** Extract the empty-state style to a CSS class (e.g. `.empty-state-msg`). Move the `max-width` constraints to named CSS classes (e.g. `.chart-section--colors`, `.chart-section--types`) or CSS custom properties so the values are documented and consistent.

### Magic numbers in `max-width` constraints
**Severity:** Low
**Lines:** 863, 867
`max-width:150px` (colors) and `max-width:180px` (types) have no explanation. The 30 px difference between them is not self-documenting, and there are no comments indicating whether these values are design tokens, empirical fits, or arbitrary choices.
**Action:** Replace with named CSS custom properties or classes with comments explaining the sizing rationale.

### `display:none` as initial state encoded in HTML
**Severity:** Low
**Lines:** 851
Using `style="display:none"` directly in markup to set initial visibility is a common pattern, but it mixes layout state into the HTML layer. It is also not togglable via CSS cascade (inline styles override class rules), making theming or animation harder to add later.
**Action:** Use the HTML `hidden` attribute (`<div id="stats-content" hidden>`) which is semantically correct, overridable with `display` in CSS, and clearly communicates intent.

## Summary
The segment has no significant complexity issues. The main pattern concerns are three inline style blocks (one carrying a reusable empty-state pattern that should be a CSS class), two unexplained magic-number `max-width` values, and the use of `style="display:none"` instead of the `hidden` attribute for initial visibility state.
