# Static Code Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `selectedBFId` undefined check is redundant
**Severity:** Low
**Lines:** 1887
`(typeof selectedBFId !== 'undefined' && selectedBFId === bfc.id)` — `selectedBFId` is always defined (initialized to `null` on line 1556), so the `typeof` guard is unnecessary. The condition simplifies to `selectedBFId === bfc.id`.
**Action:** Remove the `typeof` guard: `const selectedClass = selectedBFId === bfc.id ? ' selected' : '';`

### `bfCardHTML` reads `bfc.card.name` twice with different transformations
**Severity:** Low
**Lines:** 1886, 1892, 1897, 1901
`shortName` is derived by splitting on comma, but the full name is also used in `alt` attributes and the name div. If `bfc.card.name` is undefined (a token without a name), `bfc.card.name?.split(',')[0]` returns `undefined`, and the fallback `|| bfc.card.name` also returns `undefined`. `escapeHtml(undefined)` converts to the string `"undefined"`.
**Action:** Add a fallback: `const shortName = (bfc.card.name?.split(',')[0] ?? bfc.card.name) || 'Token';`

### `renderPlayArea` updates `play-hand-count` then `renderPlayHand` updates it again
**Severity:** Low
**Lines:** 1862, 1867, 1907
`renderPlayArea` sets `play-hand-count` on line 1867, then calls `renderPlayHand()` which sets it again on line 1907. The first set is redundant.
**Action:** Remove the `play-hand-count` assignment from `renderPlayArea` and let `renderPlayHand` be the sole owner of that DOM update.

### `bfc.card.type_line` may be undefined for tokens
**Severity:** Low
**Lines:** 1899
`bfc.card.type_line?.split('—')[1]?.trim()` — the optional chaining handles null/undefined `type_line`, but the fallback `|| 'Token'` would be triggered for any card where the type_line has no em-dash, including some legitimate types. This is an acceptable simplification for the tool.
**Action:** Document the simplification as intentional; no code change needed.

## Summary
The render functions are clean and mostly correct. The main issues are a redundant `typeof` guard, a missing name fallback that could display `"undefined"` for nameless tokens, and a double-update of `play-hand-count`.
