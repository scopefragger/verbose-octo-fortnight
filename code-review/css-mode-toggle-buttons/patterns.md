# Patterns Review — Mode Toggle Buttons
Lines: 550–557 | File: public/mtg-commander.html

## Findings

### Multiple declarations packed onto single lines
**Severity:** Low
**Lines:** 553–554, 556–557
Lines 553–554 contain five property declarations on two lines (padding, border-radius, border, background, color, font-size, cursor, transition are split across just two physical lines). Line 556 similarly stacks background, border-color, color, and font-weight. While common in single-file apps to save vertical space, this makes targeted diffs and line-level comments harder to produce and review.
**Action:** Acceptable in context of a compact single-file app, but worth noting if the file undergoes a formatting pass — one property per line is easier to scan in code review.

### Magic number: `gap: 4px`
**Severity:** Low
**Lines:** 551
The `4px` gap between toggle buttons is a bare number with no corresponding spacing token or comment. The app uses other spacing values inline throughout but has no spacing scale variable.
**Action:** If a spacing/sizing scale is ever introduced, replace `4px` with a token (e.g. `var(--space-xs)`). Low priority for a single-file app.

### Magic number: `padding: 5px 14px`
**Severity:** Low
**Lines:** 553
The `5px 14px` padding values are specific but unexplained. They appear to be tuned visually rather than derived from a scale.
**Action:** Same as above — acceptable now, but flag for a future spacing token pass.

### `transition: all 0.2s` on `.mode-btn`
**Severity:** Low
**Lines:** 554
`transition: all` is a broad target that will animate any future property added to `.mode-btn`, including layout-affecting properties like `width` or `height`, which can cause unintended jank or performance issues. Specifying only the properties that should animate (`background-color`, `border-color`, `color`) is more precise.
**Action:** Replace `transition: all 0.2s` with `transition: background-color 0.2s, border-color 0.2s, color 0.2s`.

## Summary
The segment is clean and readable at a glance. The main patterns issues are use of `transition: all` (which should be scoped to specific properties) and several magic spacing/padding numbers. Multiline property packing is a minor readability concern consistent with the rest of the single-file app's style.
