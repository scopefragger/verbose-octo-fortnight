# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Inline styles in template literals instead of CSS classes
**Severity:** Medium
**Lines:** 1873–1874, 1909, 1920
Multiple instances of inline styles are embedded directly in template literals (`style="color:var(--text-dim);font-size:0.75rem;padding:4px"`). The project already defines CSS variables and classes elsewhere; these inline styles are inconsistent with that pattern and harder to theme or override.
**Action:** Extract recurring inline styles to named CSS classes (e.g., `.zone-empty-label`, `.hand-empty-label`, `.mana-cost-badge`).

### Magic numbers in font sizes and spacing
**Severity:** Low
**Lines:** 1873, 1874, 1909, 1920
Multiple magic values appear: `0.75rem`, `0.78rem`, `0.5rem`, `4px`, `8px 0`, `2px`, `3px`, `1px 3px`. None of these are referenced from CSS variables or named constants.
**Action:** Standardise text and spacing values using CSS custom properties already defined in the file's `:root` block.

### `card.image_uris?.normal` vs `card.image_uris?.small` inconsistency
**Severity:** Low
**Lines:** 1883 (uses `.small`), 1913 (uses `.normal`)
`bfCardHTML()` uses the `small` image size for battlefield display, while `renderPlayHand()` uses `normal`. This difference may be intentional (hand cards are larger than battlefield thumbnails) but is not commented.
**Action:** Add a comment explaining the image size choice in each context to prevent future developers from "correcting" it accidentally.

### `loading="lazy"` only applied to hand cards, not battlefield cards
**Severity:** Low
**Lines:** 1890, 1918
Battlefield card images (line 1890) do not use `loading="lazy"`, while hand card images (line 1918) do. Battlefield cards are always visible when rendered, so eager loading may be appropriate — but this asymmetry should be deliberate and documented.
**Action:** Add a comment or apply `loading="lazy"` consistently based on a documented decision.

### `formatManaCostShort` called but result only used if truthy — redundant conditional
**Severity:** Low
**Lines:** 1916–1920
`costShort` is computed unconditionally, then conditionally rendered. If `card.mana_cost` is falsy, `formatManaCostShort` is never called (the ternary short-circuits). The logic is correct but could be made clearer.
**Action:** No change needed, but a comment like `// formatManaCostShort returns '' for lands` would clarify intent.

## Summary
The render functions are broadly consistent with the rest of the file but make extensive use of inline styles and magic numbers. Extracting these to CSS classes would improve maintainability and visual consistency. The `small` vs `normal` image size difference is the most likely source of future confusion and deserves a comment.
