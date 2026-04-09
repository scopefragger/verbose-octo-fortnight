# Static Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `selectedBFId` type-check guard is redundant
**Severity:** Low
**Lines:** 1887
The expression `(typeof selectedBFId !== 'undefined' && selectedBFId === bfc.id)` uses a `typeof` guard, but `selectedBFId` is initialized to `null` at line 1556 and never `undefined`. The `typeof` check is always `true` and adds noise. The correct guard for the "no selection" case should be `selectedBFId !== null`.
**Action:** Replace with `selectedBFId !== null && selectedBFId === bfc.id`.

### `renderPlayArea` updates `play-hand-count` in two places
**Severity:** Low
**Lines:** 1867, 1907
`renderPlayArea()` sets `document.getElementById('play-hand-count').textContent` at line 1867, and then `renderPlayHand()` sets the same element again at line 1907. The first assignment is immediately overwritten. This is harmless but adds confusion.
**Action:** Remove the `play-hand-count` assignment from `renderPlayArea()` since `renderPlayHand()` always follows.

### `bfCardHTML` uses `bfc.card.name?.split(',')[0]` without null guard on the result
**Severity:** Low
**Lines:** 1886
`const shortName = bfc.card.name?.split(',')[0] || bfc.card.name;` — if `bfc.card.name` is `undefined`, `name?.split(',')` returns `undefined`, so `[0]` returns `undefined`, and the fallback `|| bfc.card.name` is also `undefined`. The `escapeHtml` call on line 1892 would then receive `undefined` and render `"undefined"` via `String(str)`.
**Action:** Add a final fallback: `const shortName = bfc.card.name?.split(',')[0] || bfc.card.name || 'Unknown';`.

### `tokenColorClass` only uses the first color for multi-color tokens
**Severity:** Low
**Lines:** 1878–1879
`tokenColorClass` returns `'tok-' + colors[0]` for any token with colors, ignoring multi-color tokens (e.g. a hypothetical `{W/U}` token). Multi-color tokens will be styled as their first color only, with no visual indication they are multi-colored.
**Action:** For a simple fix, return `'tok-multi'` when `colors.length > 1`; add corresponding CSS.

## Summary
The render play area section is mostly well-structured. The primary issues are a redundant `typeof` guard, a double-write to the hand count element, and missing null safety in the `shortName` calculation. The `tokenColorClass` single-color limitation is a known simplification.
