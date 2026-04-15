# Architecture Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` is a pure HTML generator mixed with Scryfall data access patterns
**Severity:** Low
**Lines:** 1882–1903
`bfCardHTML` accesses deeply nested Scryfall API fields (`card.image_uris?.small`, `card.card_faces?.[0]?.image_uris?.small`, `card.type_line`, etc.) inline in the HTML template. This couples the rendering template to the Scryfall data shape. If the API shape changes, multiple template strings need updating.
**Action:** Extract a `getCardImageUrl(card)` helper (or verify one exists elsewhere) that encapsulates the fallback chain for image URLs. This is already partially done for the hand render (line 1913 uses the same pattern independently).

### Duplicate image URL fallback logic
**Severity:** Medium
**Lines:** 1883, 1913
Both `bfCardHTML` and `renderPlayHand` independently implement the same image URL fallback pattern: `card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small`. This is duplicated logic that must be kept in sync if Scryfall's data shape changes (e.g. adding `card_faces[1]`).
**Action:** Extract a shared `getCardImageUrl(card, size = 'small')` function and call it from both render functions.

### Render functions directly mutate DOM via innerHTML
**Severity:** Low
**Lines:** 1873–1874, 1912
`renderBattlefield` and `renderPlayHand` use `innerHTML =` to completely replace their container contents on every call. This is simple and correct for the current scale, but causes all child elements to be destroyed and re-created on each render, losing any in-progress DOM state (e.g. hover effects, animations).
**Action:** Acceptable for current scale. Add a comment noting that full re-renders are intentional and document the call trigger points.

### `tokenColorClass` is a utility function placed inside the render section
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass` is a pure mapping function that doesn't directly depend on render state. It would be better placed in the Utilities section alongside `escapeHtml`, `formatManaCostShort`, etc.
**Action:** Move `tokenColorClass` to the Utilities section (around line 2141) for better discoverability.

## Summary
The main architectural concern is the duplicated image URL fallback logic between `bfCardHTML` and `renderPlayHand`. This should be extracted to a shared helper. The rendering approach (full innerHTML replacement) is pragmatic for the current scale.
