# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `renderPlayHand` updates the hand count counter — dual responsibility
**Severity:** Low
**Lines:** 1907
`renderPlayHand()` both renders the hand cards AND updates the `play-hand-count` element, while `renderPlayArea()` also updates `play-hand-count` before calling `renderPlayHand()`. Counter state ownership is split between the two functions. Render functions should each own a single output region.
**Action:** Remove the counter update from one of the two functions. Best practice: let `renderPlayHand()` own the count display and remove the line from `renderPlayArea()`, since `renderPlayHand` has the definitive knowledge of `playHand.length`.

### `tokenColorClass` is a pure utility placed inside the render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass` is a small pure function that maps an array of color codes to a CSS class name. It has no dependency on render state and belongs in the Utilities section (lines 2141–2156) alongside `escapeHtml`, `formatManaCostShort`, etc.
**Action:** Move `tokenColorClass` to the Utilities section to keep the render section focused on HTML generation only.

### `bfCardHTML` mixes data-access logic with HTML generation
**Severity:** Medium
**Lines:** 1882–1903
`bfCardHTML` accesses nested card properties (`bfc.card.image_uris`, `bfc.card.card_faces`, `bfc.card.colors`, `bfc.card.type_line`) directly. This creates tight coupling between the render function and the Scryfall data shape. If the data model changes, every access path in this function must be updated.
**Action:** Consider extracting a `normaliseBFCard(bfc)` helper that returns a flat object with `{img, name, shortName, colors, power, toughness, subtype, tapped, id, selected}`, and let `bfCardHTML` consume that. This separates data-access from rendering.

### `canAfford` called in render function without definition visible in this section
**Severity:** Low
**Lines:** 1915
`canAfford(card.mana_cost)` is called inside `renderPlayHand` but is defined elsewhere in the file. This is acceptable given the monolithic structure, but the dependency is implicit and invisible to a reader of this section alone.
**Action:** Add a comment above `renderPlayHand` noting the external dependencies: `// Depends on: getCardType(), canAfford(), formatManaCostShort()`. This is documentation-only.

## Summary
The section's main architectural weaknesses are the split counter-ownership between `renderPlayArea` and `renderPlayHand`, tight coupling of `bfCardHTML` to the Scryfall data shape, and a utility function (`tokenColorClass`) that belongs in the Utilities section. These are moderate issues given the intentionally monolithic file structure.
