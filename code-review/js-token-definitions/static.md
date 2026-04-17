# Static Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### `keywords` property is absent on most token objects (no default)
**Severity:** Low
**Lines:** 1648, 1650, 1652, 1654–1660
Most token entries omit the `keywords` property entirely. Consumers use optional-chaining (`t.keywords?.includes(...)`) at line 2028, so there is no crash, but the schema is implicitly inconsistent — some objects have `keywords: ['Flying']` and others have no `keywords` key at all. If any future consumer forgets the `?.` guard, it will throw.
**Action:** Standardise all token objects to always include `keywords: []` as an explicit empty array, making the schema uniform and removing the need for optional-chaining on this field.

### `power` and `toughness` are strings, not numbers
**Severity:** Low
**Lines:** 1648–1661
Numeric stats (`power`, `toughness`) are stored as string literals (`'1'`, `'2'`, etc.) rather than integers. This matches the Scryfall API convention (where `power` can be `'*'`), but if any arithmetic is ever performed on these values, silent string concatenation bugs will occur (e.g. `power + 1 === '11'`).
**Action:** Add a comment noting that power/toughness follow the Scryfall string convention intentionally, to prevent a future refactor from silently converting them to numbers.

### `formatManaCostShort` placed at line 1642 — before its section heading
**Severity:** Low
**Lines:** 1642–1645
`formatManaCostShort()` is defined between the Play State section and the Token Definitions section, not inside either. It belongs in the Utilities section (lines 2141–2156) alongside `escapeHtml` and `showToast`.
**Action:** Move `formatManaCostShort` to the Utilities section, or add a comment explaining why it lives here (e.g. used by a function defined shortly after).

## Summary
The `COMMON_TOKENS` array itself is clean and readable. The main static concern is the inconsistent `keywords` schema (absent vs. explicit empty array) which could catch future consumers off guard. The misplaced `formatManaCostShort` function immediately before this section is a minor organisational issue.
