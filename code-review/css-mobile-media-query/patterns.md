# Patterns Review — Mobile Media Query
Lines: 542–548 | File: public/mtg-commander.html

## Findings

### Magic number: `560px` breakpoint
**Severity:** Low
**Lines:** 542
The breakpoint value `560px` is a bare magic number with no comment explaining the rationale. Common conventions use `480px` (phone landscape), `600px` (small tablet), or device-specific values. Without context, future maintainers cannot tell whether `560px` was chosen to match a specific device, to split the difference between two common sizes, or arbitrarily.
**Action:** Add an inline comment: `/* ≤560px — single-column phone layout */` or define the value as a CSS custom property (`--bp-mobile: 560px`) and reference it, though CSS custom properties in media queries require `env()` or a preprocessor.

### Magic numbers: `120px` / `180px` textarea heights
**Severity:** Low
**Lines:** 547
`min-height: 120px` and `max-height: 180px` are bare pixel values. Their relationship to line-height, font-size, or content expectations is not documented. If the font or padding changes, these values may need manual updating.
**Action:** Add a brief comment explaining the intent (e.g., `/* ~4–6 lines at default font size */`) to preserve the reasoning.

### Compound rule density on line 543
**Severity:** Low
**Lines:** 543
The `.layout` rule packs three distinct property changes onto one line (`grid-template-columns`, `grid-template-rows`, `height`). While brevity is generally good in CSS, the combination of shorthand and semantic overrides on a single line reduces diff readability and makes it harder to isolate individual property changes in version history.
**Action:** Consider splitting into one property per line for the layout rule, matching the style used by the other rules in this block.

## Summary
The block uses a small set of magic numbers (the `560px` breakpoint and the textarea height bounds) that lack explanatory comments. The `.layout` override is dense for a single line. All findings are low severity — adding brief inline comments would address all three without requiring any structural changes.
