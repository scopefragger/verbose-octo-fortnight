# Code & Pattern Review — Header
Lines: 37–65 | File: public/mtg-commander.html

## Findings

### `transition: all 0.2s` on `.header-back`
**Severity:** Low
**Lines:** 54
`transition: all` is a performance anti-pattern — it transitions every animatable property including layout-triggering ones like `width`, `height`, and `padding`. It also makes the transition behaviour unpredictable if new properties are added to the rule.
**Action:** Replace with explicit properties: `transition: border-color 0.2s, color 0.2s`.

### Magic padding values not using a spacing scale
**Severity:** Low
**Lines:** 41, 51
`padding: 14px 20px` and `padding: 6px 12px` are freehand values. There is no spacing scale variable (e.g. `--space-sm`, `--space-md`) in the `:root` block, so these are ad hoc throughout the file.
**Action:** Low priority for a single-file app, but if the design ever needs to be made consistent, defining 3–4 spacing steps as variables would help.

### `.header-title span` overrides `-webkit-text-fill-color` on a child element
**Severity:** Low
**Lines:** 65
The emoji/icon `<span>` inside `.header-title` resets `-webkit-text-fill-color: initial` to restore normal colour rendering. This is a workable hack but fragile — if the parent gradient clip approach changes, this override may produce unexpected results.
**Action:** Consider wrapping the text and icon in separate elements with distinct classes rather than relying on a child override.

## Summary
Reasonable CSS for a header component. Main pattern issues are `transition: all` (easy fix), and a child span override that's slightly fragile. No critical issues.
