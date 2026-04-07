# Patterns Review — Loading Spinner
Lines: 488–498 | File: public/mtg-commander.html

## Findings

### Magic numbers for size and border width
**Severity:** Low
**Lines:** 491–492
`width: 14px`, `height: 14px`, and `border: 2px` are bare literal values with no accompanying comment or variable. The 14 px size appears tuned to sit inline with text (supported by `vertical-align: middle`), but this intent is not documented. If the surrounding font size or button height changes, the spinner size would need a manual hunt-and-update.
**Action:** Either document the sizing rationale with a short inline comment (e.g., `/* sized to match 14px icon baseline */`) or promote `14px` / `2px` to CSS custom properties (`--spinner-size`, `--spinner-border`) alongside the other design tokens.

### Animation duration is a bare magic number
**Severity:** Low
**Lines:** 495
`0.7s` is an undocumented timing value. It is faster than the common 1 s convention, which is a deliberate UX choice (snappier feel), but there is no comment to that effect.
**Action:** Add a short inline comment: `/* 0.7s: intentionally snappy for inline feedback */`, or extract to a CSS variable `--spinner-duration` if animation speed is controlled globally elsewhere.

### Compact shorthand on a single line obscures intent
**Severity:** Low
**Lines:** 491
`width: 14px; height: 14px;` are written on one line. This is legal and saves vertical space, but it is inconsistent with the rest of the file's one-property-per-line style and makes line-targeted review or diff harder.
**Action:** Split onto two lines to match surrounding convention.

## Summary
The spinner block is concise and correct but contains three low-severity pattern issues: undocumented magic numbers for dimensions and animation duration, and a minor style inconsistency with same-line property pairing. None of these affect runtime behaviour, but addressing them would improve maintainability and make intent explicit.
