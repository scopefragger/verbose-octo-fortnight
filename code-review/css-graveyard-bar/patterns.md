# Patterns Review — Graveyard Bar
Lines: 696–706 | File: public/mtg-commander.html

## Findings
### Magic numbers — hardcoded pixel and rem values
**Severity:** Low
**Lines:** 698, 703, 704
`gap: 8px`, `padding: 8px 14px`, `border-radius: 6px`, `padding: 4px 12px`, and `font-size: 0.78rem` are all literal values with no connection to a design token or spacing scale. In isolation each value is readable, but across the single-file app the same values appear independently in multiple rule sets, making global spacing changes error-prone.
**Action:** Consider mapping frequently repeated values (`8px`, `6px`, `0.78rem`) to CSS custom properties on `:root` (e.g., `--space-sm`, `--radius-sm`, `--font-xs`) so they can be updated in one place.

### Inline multi-declaration shorthand on single lines reduces scannability
**Severity:** Low
**Lines:** 698, 702–703
Both `.grave-bar` and `.grave-btn` pack multiple declarations onto single lines separated by semicolons (e.g., `display: flex; gap: 8px; padding: 8px 14px; flex-shrink: 0;`). This is consistent with the style used throughout the file, so it is not an isolated anti-pattern, but it makes targeted line-level diffs harder to read and increases the chance of missing a property during review.
**Action:** If the file is ever reformatted (e.g., via Prettier with a CSS plugin), one-declaration-per-line would improve maintainability. Low priority given the single-file constraint and consistent use of the compact style elsewhere.

### No comment on the visual intent of `.grave-bar` background
**Severity:** Low
**Lines:** 699
`background: rgba(0,0,0,0.15)` creates a subtle dark tint to distinguish the bar from the play area above it. The same pattern appears at line 710 (`rgba(0,0,0,0.25)`) with a slightly different opacity for the hand strip. Without a comment, it is unclear whether the opacity difference is intentional or a copy-paste artefact.
**Action:** Add a brief inline comment — e.g., `/* slightly lighter than hand strip to create visual depth hierarchy */` — or normalise the two values.

## Summary
The segment follows the file's established compact-CSS style. Three low-severity pattern issues exist: magic numbers that are not tied to a design-token system, multi-declaration single lines that reduce diff readability, and an undocumented opacity difference between the graveyard bar and the adjacent hand-strip bar. None of these are blocking concerns.
