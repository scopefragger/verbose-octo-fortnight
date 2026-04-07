# Architecture Review — Play Hand Strip
Lines: 708–731 | File: public/mtg-commander.html

## Findings

### Dimensions duplicated between CSS and JS render logic
**Severity:** Low
**Lines:** 721, 728
**Description:** `.play-hand-card` fixes `width: 80px` in CSS, and `.play-hand-card-text` independently hard-codes `width: 62px; height: 86px`. The text fallback dimensions (62 × 86) appear to be a manually derived subset of the card width, likely intended to approximate a card face. If the card width ever changes in CSS, the text-face dimensions must be updated separately and in sync. Because the app is a single-file HTML document, there is no shared design-token layer to enforce this relationship.
**Action:** Consider deriving the text card dimensions from the parent card width using `width: 100%` and an aspect-ratio (e.g., `aspect-ratio: 63/88` for standard card proportions), removing the absolute pixel dependency.

### Hand strip layout concern — no max-height or scroll cap on the strip itself
**Severity:** Low
**Lines:** 709–712
**Description:** `.play-hand-strip` uses `flex-shrink: 0` and relies on `.play-hand-cards` for horizontal scroll. However, if the parent flex column does not have a constrained height (e.g., `overflow: hidden` or `max-height`), the strip could push the battlefield zone off-screen on small viewports. The architecture places sizing responsibility on the parent play area grid rather than the strip itself, creating an implicit coupling.
**Action:** Verify that the parent play area container enforces a maximum height for the strip or that the strip is always used in a height-constrained flex column. Document this expectation with a comment.

## Summary
The segment is structurally straightforward CSS. The primary architectural concern is the hard-coded absolute dimensions on the text fallback card face, which creates a fragile manual coupling to the parent card width. The strip also implicitly depends on its parent for height containment without documenting that contract.
