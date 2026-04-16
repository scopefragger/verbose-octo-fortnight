# Static Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Missing `keywords` field on non-keyword tokens
**Severity:** Low
**Lines:** 1648, 1650, 1652, 1654, 1655, 1656, 1657, 1658, 1659, 1660
**Description:** Most token objects omit the `keywords` property entirely. Any consumer that does `token.keywords.includes(...)` without a null-guard will throw a TypeError at runtime. The three artifact tokens (Treasure, Food, Clue) also omit `keywords`, and the Thopter token includes it — so the shape is inconsistent across the array.
**Action:** Either add `keywords: []` as a default on every object that lacks it, or ensure every call-site accesses the field via `token.keywords ?? []`.

### `power` / `toughness` typed as strings, not numbers
**Severity:** Low
**Lines:** 1647–1661
**Description:** All power/toughness values are stored as string literals (`'1'`, `'2'`, etc.). If any arithmetic is performed on them (e.g. applying a +1/+1 counter) the result will be string concatenation instead of addition.
**Action:** Use numeric literals (`power: 1`) or document clearly that these are always strings and enforce that convention at every call-site with a comment.

## Summary
The array is a clean, readable constant but has two latent bugs: missing `keywords` fields that will cause null-reference errors in careless consumers, and string-typed stats that silently break arithmetic. Both are easy to fix by normalising the object shape.
