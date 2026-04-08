# Patterns Review — State
Lines: 1032–1037 | File: public/mtg-commander.html

## Findings

### `mulliganCount` reset is implicit
**Severity:** Low
**Lines:** 1035
`mulliganCount` is initialised to `0` but the semantic meaning (0 = no mulligans taken, first draw is free) is not documented. Reset logic is spread across `drawHand()` and `clearDeck()` rather than centralised.
**Action:** Add a comment: `// reset to 0 on each new draw; free keep = 0 mulligans`.

### No cache eviction strategy documented
**Severity:** Low
**Lines:** 1037
`cardCache` accumulates Scryfall data for the page lifetime with no eviction. For typical use (one deck per session) this is fine, but there is no comment noting this is intentional and not an oversight.
**Action:** Add a comment: `// page-lifetime cache — no eviction needed for single-session use`.

### `deck` item shape not enforced
**Severity:** Low
**Lines:** 1033
The `{name, qty, data}` shape described in the comment is a convention, not an enforced type. Downstream code that accesses `deck[i].data` will silently fail if the shape is ever wrong.
**Action:** The comment is good; consider adding a JSDoc `@typedef` or a short inline type note for future maintainers.

## Summary
The state declarations are clean and appropriately commented for a single-file app. Patterns findings are all low severity, centred on missing documentation for implicit behaviours (`mulliganCount` reset, cache lifetime, deck item shape).
