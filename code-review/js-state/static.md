# Static Review — State
Lines: 1032–1037 | File: public/mtg-commander.html

## Findings

### `deckLoaded` undocumented in section description
**Severity:** Low
**Lines:** 1036
`deckLoaded` is declared here but is absent from the section description (`deck[]`, `hand[]`, `mulliganCount`, `cardCache`). It is a fifth piece of state that controls guard logic throughout the file (import, save, hand simulator) and deserves equal billing.
**Action:** Update the section banner comment to include `deckLoaded`.

### `deck` and `hand` store different shapes
**Severity:** Low
**Lines:** 1033–1034
`deck` stores `{name, qty, data}` wrapper objects, while `hand` stores raw Scryfall card data objects directly. This asymmetry is subtle and can cause confusion in downstream code (e.g. `hand[i]` vs `deck[i].data`).
**Action:** Add a clarifying comment on `hand` noting it holds raw Scryfall objects, not deck-entry wrappers.

### `cardCache` plain-object prototype risk
**Severity:** Low
**Lines:** 1037
Using a plain `{}` as a string-keyed dictionary means inherited prototype properties (`constructor`, `toString`, `__proto__`) could theoretically collide with card names that share those strings.
**Action:** Consider `let cardCache = Object.create(null)` or a `Map` to eliminate prototype-chain collisions.

## Summary
The state block is concise and well-commented. The main static concerns are a missing variable in the section description, a subtle shape asymmetry between `deck` and `hand`, and a theoretical prototype-collision risk in `cardCache`.
