# Static Review — Card Context Menu
Lines: 647–658 | File: public/mtg-commander.html

## Findings
### Relies on undeclared custom property `--card-border`
**Severity:** Low
**Lines:** 649
The `border` rule references `var(--card-border)`. If this CSS custom property is not defined in a `:root` block elsewhere in the stylesheet, the border will fall back to its initial value (effectively invisible), making the menu border silently disappear without any error. A quick grep confirms this variable name should be verified against the `:root` declarations.
**Action:** Confirm `--card-border` is defined in `:root` (or the appropriate cascade root). If it is a typo or renamed variable, update to the correct property name.

### `display: none` as default state managed purely through CSS
**Severity:** Low
**Lines:** 651
The menu is hidden via `display: none` in the stylesheet. Visibility is toggled by JavaScript that likely sets `style.display` inline. This creates two sources of truth for the displayed state and makes it harder to search for where the menu is shown or hidden. There is no named state class (e.g., `.ctx-menu--visible`) used to govern visibility.
**Action:** Consider toggling a `.is-visible` class and driving the `display` rule from that class, keeping visibility logic in CSS and keeping JS free of style property assignments.

## Summary
The block is small and well-scoped. The main static concern is a dependency on `--card-border` that must be verified as defined elsewhere. The `display: none` default couples JS tightly to a raw style property rather than a semantic class toggle.
