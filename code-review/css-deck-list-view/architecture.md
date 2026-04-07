# Architecture Review — Deck List View
Lines: 500–535 | File: public/mtg-commander.html

## Findings

### Deck list styles co-located with unrelated component styles in a single file
**Severity:** Low
**Lines:** 500–535
The entire application — CSS, HTML, and JavaScript — lives in one 2159-line file. The deck list view styles are correctly grouped under a `/* === DECK LIST VIEW === */` comment, but there is no enforced boundary preventing style bleed or accidental selector collisions as the file grows. This is an existing architectural constraint of the single-file design rather than a bug introduced here.
**Action:** No immediate action needed within this section, but if the file continues to grow, extracting component CSS into `<link>`-ed stylesheets or a CSS custom-property theme file would improve maintainability.

### `.qty` width hard-coded to 16px couples presentation to data range
**Severity:** Low
**Lines:** 532
`width: 16px` on `.card-entry .qty` is sufficient only for single- or double-digit quantities. Commander decks cap at 1 copy per card (except basic lands), so this is unlikely to overflow in practice, but the assumption is implicit and undocumented. If the component is ever reused for non-Commander formats, a value like `3x` or `12x` would overflow.
**Action:** Consider `min-width: 16px` or `width: 2ch` to be format-agnostic, and add a brief comment noting the Commander-specific assumption.

## Summary
The architectural concerns are low-severity for a deliberately single-file application. The deck list CSS is well-compartmentalised within the file via a clearly labelled comment block. The only coupling issue worth noting is the fixed `16px` quantity column width, which silently assumes single-digit quantities appropriate to Commander but would fail for other formats.
