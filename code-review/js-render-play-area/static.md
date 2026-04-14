# Static Code Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `selectedBFId` undefined check is redundant
**Severity:** Low
**Lines:** 1887
`(typeof selectedBFId !== 'undefined' && selectedBFId === bfc.id)` — `selectedBFId` is declared at module scope and initialised to `null`. The `typeof` guard is unnecessary; `selectedBFId === bfc.id` is sufficient (null never equals a UUID string).
**Action:** Simplify to `selectedBFId === bfc.id`.

### `renderPlayHand` updates `play-hand-count` twice per render cycle
**Severity:** Low
**Lines:** 1907, 1867
`renderPlayArea()` calls `renderPlayHand()` which sets `play-hand-count` on line 1907. `renderPlayArea()` itself also sets `play-hand-count` on line 1867. The second write always wins (both set the same value), but it is redundant.
**Action:** Remove the `play-hand-count` update from `renderPlayArea` since `renderPlayHand` handles it.

### `bfCardHTML` splits card name on first comma for `shortName`
**Severity:** Low
**Lines:** 1886
`bfc.card.name?.split(',')[0]` — this truncates double-faced card names like "Arlinn, the Pack's Hope" to "Arlinn". This is intentional for display brevity but is a lossy transformation applied silently. If `card.name` is undefined, the fallback `|| bfc.card.name` is also undefined.
**Action:** Add a final fallback: `|| 'Unknown'` to ensure `shortName` is always a string.

### `tokenColorClass` only uses the first color for multi-color tokens
**Severity:** Low
**Lines:** 1879
`'tok-' + colors[0]` — if a token has multiple colors (e.g., a Gold token), only the first color class is applied. There is no `tok-multi` handling.
**Action:** Add a check: if `colors.length > 1`, return `'tok-multi'` and add a corresponding CSS class for gold/multi-color tokens.

## Summary
The rendering functions are generally correct. Key issues are a redundant `typeof` guard, a duplicated DOM write for hand count, and a missing multi-color token class. None are critical bugs in the current token set since no common token has multiple colors.
