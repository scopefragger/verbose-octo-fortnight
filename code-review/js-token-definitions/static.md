# Static Code Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Missing `keywords` property on non-flying tokens
**Severity:** Low
**Lines:** 1648, 1650, 1652, 1654–1658
The token objects that have no keywords omit the `keywords` property entirely. At line 2028 the consumer uses optional chaining (`t.keywords?.includes('Flying')`), which handles this safely today. However, any future code that iterates over keywords without using optional chaining (e.g. `t.keywords.forEach(...)`) will throw a `TypeError`. Inconsistent shape across objects in the same array is a latent bug.
**Action:** Add `keywords: []` to every token object that currently omits the property so all entries share a uniform schema.

### `power` and `toughness` are strings for creatures but `null` for artifacts
**Severity:** Low
**Lines:** 1648–1661
Creature tokens use string values (`'1'`, `'2'`, etc.) while artifact tokens use `null`. Consumers must branch on `null` before any numeric comparison (e.g. calculating total power on the battlefield). There is no JSDoc or comment documenting that `null` is a valid value and what it means.
**Action:** Add an inline comment explaining the null convention, or use a sentinel like `''` (empty string) consistently, whichever callers already expect.

### No `id` or stable key on token definitions
**Severity:** Low
**Lines:** 1647–1662
Each entry has no stable identifier. The consumer at line 2026 uses the array index `i` implicitly via the `onclick` call but does not reference `i` at all — identity is conveyed by passing the full serialised object. This means two tokens with identical names are indistinguishable at definition time, which could cause issues if the array is ever filtered or re-ordered.
**Action:** Consider adding a short `id` string (e.g. `'soldier-1-1'`) to each definition to uniquely identify tokens without relying on array position.

## Summary
The array is a straightforward data constant with no logic errors. The main static concern is the inconsistent object shape (some objects lack a `keywords` field) which is safe today due to optional chaining at the call site but is a latent bug for future consumers.
