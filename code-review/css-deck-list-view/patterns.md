# Patterns Review — Deck List View
Lines: 500–535 | File: public/mtg-commander.html

## Findings

### Magic numbers — spacing and sizing values not tied to a design token
**Severity:** Low
**Lines:** 504, 508, 512, 514, 517, 524–525, 527, 529, 532
Values such as `10px` (padding), `0.7rem` / `0.78rem` (font sizes), `1px` (letter-spacing), `8px` (gap/padding), `4px` (border-radius, padding, margin), `6px` (border-radius), `0.15s` (transition), `16px` (qty width), and `0.06` (hover alpha) are all magic literals. Other parts of the file likely repeat some of these values independently, meaning a future design change requires a multi-point find-and-replace rather than a single token update.
**Action:** Centralise recurring spacing, radius, font-size, and alpha values as CSS custom properties (e.g., `--space-sm: 4px`, `--radius-sm: 4px`, `--font-size-xs: 0.7rem`) in the `:root` block.

### Inline background colour literal duplicates theme token intent
**Severity:** Low
**Lines:** 515
`background: rgba(201,168,76,0.08)` hard-codes the RGB values of `--gold` rather than deriving from the token (e.g., `rgba(var(--gold-rgb), 0.08)`). If the gold colour is ever updated, this literal would be missed.
**Action:** Either expose a `--gold-rgb` variable for use in `rgba()` calls, or use a pre-computed `--gold-muted` token.

### Inconsistent border-radius values within the same component
**Severity:** Low
**Lines:** 516, 530
`.card-type-header` uses `border-radius: 4px` and `.card-entry` uses `border-radius: 6px`. The visual difference is subtle and may be intentional (header slightly squarer, row slightly rounder), but it is not documented and could look inconsistent under close inspection.
**Action:** Verify intent; if unintentional, normalise to a single token (e.g., `--radius-sm`).

### No comment explaining the flex layout or the `flex-shrink: 0` on `.qty`
**Severity:** Low
**Lines:** 521–534
The three-column flex layout (qty / name / mana cost) is reasonably clear, but `flex-shrink: 0` on `.qty` has no comment explaining why it must not shrink. A future editor may remove it not understanding it prevents the quantity badge from collapsing at narrow widths.
**Action:** Add a short inline comment: `/* prevent qty badge from collapsing at narrow widths */`.

## Summary
The section is clean and readable CSS but relies heavily on magic-number literals for spacing, sizing, and colour values. Centralising these as design tokens would reduce drift as the project grows. The duplicated gold colour literal on line 515 is the highest-priority pattern fix since it would silently diverge from the theme if `--gold` is ever changed.
