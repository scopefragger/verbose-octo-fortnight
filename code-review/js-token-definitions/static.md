# Static Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Array is not frozen — mutable at runtime
**Severity:** Low
**Lines:** 1647–1662
`COMMON_TOKENS` is declared with `const` but its contents are a mutable array of mutable objects. Any code that accidentally mutates an element (e.g. `COMMON_TOKENS[0].power = '2'`) will silently corrupt all future token creation from that preset.
**Action:** Use `Object.freeze` on each entry and the array itself, or use a getter function that returns deep copies.

### Missing `keywords` property on most token entries
**Severity:** Low
**Lines:** 1648–1662
Several tokens lack a `keywords` array entirely (e.g. Soldier, Cat, Zombie). Code that accesses `t.keywords?.includes(...)` safely handles this via optional chaining, but it is an inconsistency in the data shape. Tokens without keywords could explicitly set `keywords: []` for uniform shape.
**Action:** Add `keywords: []` to all token objects that currently omit the property for consistency.

## Summary
The token definitions array is a straightforward data constant with no logic bugs. The primary concerns are mutability (no freeze) and inconsistent object shape (missing `keywords` on most entries). These are low-severity data quality issues with no immediate runtime impact.
