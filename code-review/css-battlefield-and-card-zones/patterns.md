# Patterns Review — Battlefield & Card Zones
Lines: 581–636 | File: public/mtg-commander.html

## Findings

### Magic numbers for card and wrap dimensions
**Severity:** Medium
**Lines:** 597–603
`130px` (wrap width/height), `86px` (image width), `120px` (image height), and `120px` (`.bf-card-name` max-width) are bare numeric literals. The relationship between them (image is centered inside the wrap with 22px of headroom for the card name below) is invisible without reading the full layout carefully. `120px` appears twice with different meanings (wrap height vs. card name max-width), which adds to confusion.
**Action:** Introduce CSS custom properties `--bf-card-w: 86px`, `--bf-card-h: 120px`, `--bf-wrap-size: 130px` at the top of the battlefield section and reference them throughout. This documents intent and prevents silent drift.

### Repeated `rgba(0,0,0,0.6)` shadow value
**Severity:** Low
**Lines:** 606, 625
Both `.bf-card-img` and `.bf-token` use `box-shadow: 0 2px 10px rgba(0,0,0,0.6)` as their base shadow. The identical value is duplicated across two rules. Similarly, the hover/selected gold glow `rgba(201,168,76,0.5)` appears on lines 608 and 613.
**Action:** Extract these into CSS custom properties (`--shadow-card-base`, `--shadow-card-glow`) to eliminate the duplication and make theme-wide shadow changes a one-line edit.

### Inline shorthand chains reduce readability
**Severity:** Low
**Lines:** 583–584, 595, 598–600, 622–625
Several rules pack four or more properties onto a single line (e.g., line 595: `display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start;`). While this is a common single-file style, it makes line-level diffs noisy and properties harder to scan.
**Action:** No change required for correctness, but if the file is ever refactored, expanding to one-property-per-line in hot-edit areas (like `.bf-wrap` and `.bf-token`) would improve maintainability.

### `0.65rem` / `0.6rem` / `0.7rem` font-size ladder
**Severity:** Low
**Lines:** 592, 617, 624, 634, 636
Five distinct sub-rem font sizes are used across zone label, card name, token body, token name, and token type. The differences between `0.6rem` and `0.65rem` are imperceptible at most screen densities, suggesting the ladder was grown incrementally rather than designed.
**Action:** Consolidate to two or three named size steps (e.g., `--text-xs: 0.6rem`, `--text-sm: 0.7rem`) and apply them consistently across all battlefield text nodes.

### No comment explaining the `.bf-token` modifier class convention
**Severity:** Low
**Lines:** 628–633
The `.tok-W/U/B/R/G/C` suffix convention (WUBRG + colorless) is meaningful to MTG players but opaque to anyone unfamiliar with the game. There is no comment explaining the convention, what the letters mean, or whether the list is exhaustive.
**Action:** Add a brief comment above line 628, e.g., `/* Token color classes: W=White, U=Blue, B=Black, R=Red, G=Green, C=Colorless */`.

## Summary
The primary pattern concern is the cluster of magic pixel numbers governing card and wrap dimensions — they encode an implicit layout contract that is invisible in the CSS. The repeated shadow and glow values are a secondary duplication smell. Font-size micro-variations and missing convention comments are low-friction issues that accumulate readability debt over time.
