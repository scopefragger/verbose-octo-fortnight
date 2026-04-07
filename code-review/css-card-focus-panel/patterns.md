# Patterns Review — Card Focus Panel
Lines: 660–695 | File: public/mtg-commander.html

## Findings

### Magic RGBA colour literals instead of design tokens
**Severity:** Low
**Lines:** 663, 675, 685, 688, 690, 692
Multiple hard-coded `rgba()` values are used for backgrounds and shadows: `rgba(0,0,0,0.6)`, `rgba(255,255,255,0.06)`, `rgba(255,255,255,0.12)`, `rgba(201,168,76,0.2)`, `rgba(201,168,76,0.35)`, `rgba(224,85,85,0.4)`, `rgba(224,85,85,0.15)`. The gold-derived values (`201,168,76`) and red-derived values (`224,85,85`) are already represented by `--gold` and `--red` tokens but are repeated as raw RGB triples in alpha variants.
**Action:** Define alpha-variant tokens (e.g. `--gold-20: rgba(201,168,76,0.2)`) in `:root` or use `color-mix(in srgb, var(--gold) 20%, transparent)` (supported in all modern browsers) so colour changes propagate automatically.

### Multiple declarations packed onto single lines
**Severity:** Low
**Lines:** 662, 665, 666, 674, 677, 684, 685
Rules like `position: absolute; bottom: 0; left: 0; right: 0;` and `display: flex; align-items: flex-start; gap: 16px;` are collapsed onto one line. While space-saving in a single-file app, this makes diff review and property searches harder.
**Action:** Expand multi-declaration lines to one property per line. In a single-file app this is a style preference, but it meaningfully reduces merge conflicts and grep noise.

### `z-index: 20` is a magic number
**Severity:** Low
**Lines:** 667
The value `20` carries no semantic meaning at the call site. Without context it is impossible to know whether this is intentionally above or below the context menu, modal overlays, or toast.
**Action:** Replace with a CSS custom property (`var(--z-focus-panel)`) defined alongside other layer values, or at minimum add an inline comment: `/* above battlefield cards (10), below modals (100) */`.

### `max-height: 60px` on oracle text is a presentational constant
**Severity:** Low
**Lines:** 681
The 60 px cap on oracle text is arbitrary. For cards with long oracle text (e.g. Planeswalkers, sagas) this truncates relevant information with no visual affordance beyond the scroll indicator.
**Action:** Consider `max-height: 4.5em` (line-height-relative) for consistency, and verify that the `overflow-y: auto` scrollbar is visible enough on the dark background.

## Summary
The segment is tidy and readable but relies on repeated magic RGBA literals that should be tokenised, and on multi-property single-line declarations that are harder to diff. The `z-index` and oracle `max-height` values both benefit from documentation or token extraction to make intent explicit.
