# Static Review — Play Area
Lines: 559–565 | File: public/mtg-commander.html

## Findings

### Conflicting display values on the same declaration block
**Severity:** Low
**Lines:** 562
`display: none; flex-direction: column;` are written on the same line within `.play-area`. `flex-direction` is defined while `display` is `none`, which is harmless at runtime but creates a misleading read — a developer scanning the rule may not immediately realise the flex context is dormant until `.active` is applied. There is no undefined reference or null-guard issue in a CSS-only block, but the co-location of an inactive layout property alongside the hiding declaration is a static clarity concern.
**Action:** Move `flex-direction: column;` to the `.play-area.active` rule (line 565) so all flex properties live with the state that makes them active, or add a brief inline comment noting the intentional pattern.

## Summary
The block is syntactically correct with no undefined selectors, dead rules, or naming problems. The only static concern is `flex-direction` being declared alongside `display: none`, which is inert but can mislead readers about when the flex context applies.
