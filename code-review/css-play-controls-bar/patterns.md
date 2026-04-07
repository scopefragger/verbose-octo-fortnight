# Patterns Review — Play Controls Bar
Lines: 567–580 | File: public/mtg-commander.html

## Findings

### Long single-line rule declarations reduce scannability
**Severity:** Low
**Lines:** 568, 570, 572, 573, 574, 575
Multiple rules chain many properties onto one line (e.g., line 575 has 13 properties on a single line for `.life-btn`). This is a consistent project-wide style, but it makes it hard to diff individual property changes, scan for a specific property, or read during review without horizontal scrolling.
**Action:** No change required if the single-line style is an intentional project convention. If the file is ever reformatted, switching to one property per line for multi-property rules would improve maintainability.

### Magic number: `28px` min-width on `.life-val`
**Severity:** Low
**Lines:** 574
`min-width: 28px` on `.life-val` is a magic number sized to fit a 2–3 digit life total at `1.1rem`. If font size or life total digits change (e.g., a player with 200+ life), this value silently clips. There is no comment explaining the sizing rationale.
**Action:** Add a comment explaining the value (e.g., `/* fits up to 3-digit life totals */`) or derive it from a CSS custom property if life-display sizing is referenced elsewhere.

### Magic number: `22px` button size and `0.15s` transition on `.life-btn`
**Severity:** Low
**Lines:** 575
`width: 22px; height: 22px` and `transition: all 0.15s` are raw numbers with no shared token. If button sizing or animation speed needs to change globally across all control bar buttons, each rule must be updated individually.
**Action:** Consider CSS custom properties such as `--ctrl-btn-size` and `--transition-fast` to centralize these values, especially if the same sizes appear in adjacent button rules.

### No comments on any rule in this block
**Severity:** Low
**Lines:** 567–580
The surrounding CSS file uses `/* === SECTION === */` header comments for major blocks, but this segment has no comments at all. Given the segment mixes interactive controls (`.life-btn`, `.life-display`) with layout primitives (`.sep`) and passive badges (`.turn-badge`, `.library-badge`), a brief header comment would aid navigation.
**Action:** Add a `/* === PLAY CONTROLS BAR === */` comment at line 567 to match the project's existing comment convention.

## Summary
The segment follows the project's terse single-line CSS style consistently but accumulates several low-severity pattern issues: magic numbers for button dimensions and life-value width, no section header comment, and long lines that are hard to diff. None of these are defects, but adding comments and extracting two or three magic numbers into CSS custom properties would meaningfully improve maintainability.
