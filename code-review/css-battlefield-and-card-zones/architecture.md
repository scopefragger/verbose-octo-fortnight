# Architecture Review — Battlefield & Card Zones
Lines: 581–636 | File: public/mtg-commander.html

## Findings

### Token color theming encoded in CSS rather than data
**Severity:** Medium
**Lines:** 628–633
The six `.tok-W/U/B/R/G/C` modifier classes hard-code per-color background, border, and text colors directly in CSS. The JavaScript segment (JS section 15, `COMMON_TOKENS`) presumably selects which class to apply at render time. This creates a two-place maintenance contract: adding a new color identity (e.g., a gold/multicolor token) requires a CSS change here AND a data change in the JS token definitions. In a single-file app this coupling is low-cost today, but it violates the principle that visual token identity should be owned by one place.
**Action:** Consider moving the color palette into a CSS custom-property map keyed by color letter (e.g., `--tok-W-bg`, `--tok-W-border`) or into a JS-driven `style` attribute at render time so the token color contract lives entirely in one layer.

### `.bf-wrap` and `.bf-card-img` encode fixed pixel dimensions
**Severity:** Low
**Lines:** 597–603
Card wrap is fixed at `130×130px` and the card image at `86×120px`. These are load-bearing layout numbers that must agree with each other and with any JavaScript that calculates hit areas or overlap. If card size ever needs to change (e.g., a compact mode or mobile breakpoint), both values must be updated in sync.
**Action:** Express the card image size as CSS custom properties (`--card-w`, `--card-h`) so the wrap can derive its size relative to them, reducing the number of places a resize must touch.

### Battlefield layout concern: gap is zero on `.battlefield` but ten pixels on `.bf-zone-cards`
**Severity:** Low
**Lines:** 583–584, 595
`.battlefield` sets `gap: 0` between zone rows, then `.bf-zone` applies `border-bottom` for visual separation. The gap between cards inside a zone is controlled by `.bf-zone-cards`'s `gap: 10px`. These are three different mechanisms (gap suppression, border, inner gap) for what is essentially one spacing system. It works but is harder to adjust consistently.
**Action:** No urgent change, but document the intent or consolidate spacing into a single gap/padding variable if the layout is revisited.

## Summary
The main architectural concern is the split ownership of token color identity between CSS modifier classes and JavaScript token data. The fixed pixel dimensions create a secondary coupling risk if a responsive or compact view is ever needed. Neither issue is blocking, but both will grow in cost if the feature set expands.
