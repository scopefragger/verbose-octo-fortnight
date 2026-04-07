# Static Code Review — Stats Panel
Lines: 280–344 | File: public/mtg-commander.html

## Findings

### `getCardCMC` is redundant for both branches
**Severity:** Low
**Lines:** 1197–1201 (JS context for the CSS-driven component)
Both branches of the `if` in `getCardCMC` return `card.cmc || 0` — the `card_faces` check adds no distinction. The function body for the `card_faces` case should likely use `card.card_faces[0].cmc` for DFCs/split cards, but instead falls through to the same value as the base case, silently returning the wrong CMC for many double-faced cards.
**Action:** Decide whether DFC CMC should come from `card.cmc` (correct for most DFCs in Scryfall) or `card.card_faces[0].cmc`. If `card.cmc` is always correct, remove the dead branch. If face-level CMC is sometimes needed, fix the branch to actually read from `card_faces`.

### `colorMap` object declared but never used
**Severity:** Low
**Lines:** 1258 (JS `updateStats`)
`const colorMap = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };` is defined but never referenced. The subsequent logic uses the `colorOrder` array directly.
**Action:** Remove the dead `colorMap` declaration.

### Mana curve bar height arithmetic is implicit
**Severity:** Low
**Lines:** 1248
`Math.round((v/maxVal)*56)+2` — the constants `56` and `2` are not guarded against the container height defined in CSS (`.mana-curve { height: 70px }`). If the CSS height changes, the JS arithmetic silently produces bars that overflow or look wrong.
**Action:** Document the relationship (56 px drawable area + 2 px min-height = up to 58 px inside a 70 px container that also reserves space for `.curve-count` and `.curve-label`), or derive the drawable height from the element at runtime.

### No null guard on `document.getElementById` results before property access
**Severity:** Low
**Lines:** 1232–1235, 1244, 1259, 1274, 1285–1286
All six `getElementById` calls inside `updateStats` are used without null checks. If the HTML template changes and any ID is renamed or removed, a silent `TypeError` will crash the entire stats render.
**Action:** Add null guards or assert at startup that all required IDs exist.

## Summary
The CSS segment itself (lines 280–344) is clean and consistent. The primary static issues are in the companion JS (`updateStats`/helpers): a dead branch in `getCardCMC`, an unused `colorMap` variable, magic pixel constants that are silently coupled to the CSS, and missing null guards on all DOM lookups.
