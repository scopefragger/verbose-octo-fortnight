# Architecture Review — Deck List
Lines: 1289–1323 | File: public/mtg-commander.html

## Findings

### `renderDeckList` reads global `deck` directly
**Severity:** Low
**Lines:** 1290, 1295
`renderDeckList` accesses the global `deck` array directly rather than receiving it as a parameter. This couples the render function to global state and makes it impossible to render an arbitrary deck (e.g. for a preview).
**Action:** Consider `function renderDeckList(deckData = deck)` to allow both use cases while maintaining backwards compatibility.

### Type order array duplicates information from `getCardType`
**Severity:** Low
**Lines:** 1301
The `order` array (`['Commander','Creature',...]`) partially mirrors the type names returned by `getCardType`. The two must be kept in sync manually. A mismatch (e.g. adding a new type to `getCardType` without adding it to `order`) would cause the new type to be silently dropped from the list view.
**Action:** Consider deriving the `order` array from the same type name constants used in `getCardType`, or document the dependency explicitly.

### `formatManaCost` defined at the bottom of this section — scope mismatch
**Severity:** Low
**Lines:** 1321–1322
`formatManaCost` is a utility function placed at the end of the Deck List section, but it is also used in other rendering contexts. It should either be in the Utilities section (alongside `formatManaCostShort`) or clearly labelled as deck-list-specific.
**Action:** Move `formatManaCost` to section 23 (Utilities) alongside `formatManaCostShort`.

## Summary
`renderDeckList` is correct and readable. Key architecture issues: global `deck` dependency, type order/getCardType coupling, and `formatManaCost` misplaced from the Utilities section.
