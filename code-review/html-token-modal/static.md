# Static Code Review — Token Modal
Lines: 982–999 | File: public/mtg-commander.html

## Findings

### Inconsistent Color Select Placeholder
**Severity:** Low
**Lines:** 978–985

The `<select>` element for token color uses inline styles for configuration (background, border, border-radius, padding, color, font-size) but these styles duplicate CSS class definitions that could be used instead (.token-custom).

**Action:** Extract inline styles to a CSS class or reuse `.token-custom input` class structure. This improves maintainability and consistency.

### Unused/Untested Elements in Select
**Severity:** Low
**Lines:** 979–984

The color options (W, U, B, R, G, C) are hardcoded but there's no visible validation that the selected color maps correctly to the MTG color system. The `colors: [color]` in `addCustomToken()` (line 1855) passes a single character; ensure this format is expected by the rendering logic.

**Action:** Add a comment documenting the expected format, or add a constants object (`const MTG_COLORS = { W: 'White', U: 'Blue', ... }`) to centralize color definitions.

### Missing ID on Select Element
**Severity:** Low
**Lines:** 978

The `<select>` element has `id="custom-token-color"` which is good, but no `name` attribute. For accessibility and form submission clarity, add `name="color"`.

**Action:** Add `name="color"` attribute to the select element.

## Summary

No critical issues found. The token modal markup is straightforward and functional, but could benefit from extracting inline styles and centralizing MTG color definitions for better maintainability.
