# Static Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `renderPlayHand()` updates `play-hand-count` element redundantly
**Severity:** Low
**Lines:** 1863, 1867, 1907
`renderPlayArea()` sets `play-hand-count` at line 1867, and then immediately calls `renderPlayHand()` at line 1861, which also sets `play-hand-count` at line 1907. The second write is redundant (it overwrites the first with the same value) but harmless. However, it also means `renderPlayHand()` has a hidden side-effect on an element outside the hand container — making the function's scope broader than its name implies.
**Action:** Remove the `play-hand-count` update from `renderPlayHand()` and keep it only in `renderPlayArea()`, since `renderPlayHand` is also called standalone from `renderManaPool()` (line 1634) and shouldn't need to update the count in that context.

### `typeof selectedBFId !== 'undefined'` guard is unnecessary
**Severity:** Low
**Lines:** 1887
`selectedBFId` is declared with `let` at module scope (line 1556), so it is always defined (never `undefined` in the `typeof` sense — it may be `null`, but not undeclared). The guard `typeof selectedBFId !== 'undefined'` is a leftover pattern for truly undeclared variables and is misleading here.
**Action:** Replace with a direct `selectedBFId === bfc.id` check (the existing `null` value is already falsy and will not match any `bfc.id`).

### `bfc.card.type_line?.split('—')[1]?.trim()` may produce wrong display for non-em-dash type lines
**Severity:** Low
**Lines:** 1899
The split uses an em dash (`—`) matching Scryfall's format. If `type_line` contains a hyphen or is missing the separator entirely, `split('—')[1]` is `undefined`, and the optional-chain falls back to `'Token'` — which is correct. However, tokens with multiple subtypes (e.g. `'Token Artifact Creature — Thopter'`) produce `' Thopter'` with a leading space before `.trim()` is called. This is fine, but it is worth documenting.
**Action:** Add a brief comment explaining the split convention and that `.trim()` handles the leading space.

### `shortName` fallback uses `|| bfc.card.name` which is the same source as the split input
**Severity:** Low
**Lines:** 1886
`const shortName = bfc.card.name?.split(',')[0] || bfc.card.name;` — if `bfc.card.name` is an empty string, `split(',')[0]` returns `''`, which is falsy, and the expression falls back to `bfc.card.name` (also `''`). The fallback is redundant; the real guard needed is for `bfc.card.name` being `null`/`undefined`, which the optional-chain on `?.split` already handles (returning `undefined`, triggering the fallback correctly).
**Action:** Simplify to `const shortName = (bfc.card.name || '').split(',')[0];`.

### No null guard on `document.getElementById` calls in `renderPlayArea()`
**Severity:** Medium
**Lines:** 1862–1867
All six `getElementById` calls in `renderPlayArea()` lack null guards. If called before the DOM is ready or in a context where the play-area panel is hidden/removed, any one of them will throw `TypeError: Cannot set properties of null`.
**Action:** Add an early-exit guard at the top of `renderPlayArea()`: check that at least the primary container element exists before proceeding.

## Summary
The rendering functions are generally correct and readable. The main static concerns are the redundant `play-hand-count` update in `renderPlayHand()`, the misleading `typeof` guard on `selectedBFId`, and the absence of null guards on DOM element lookups in `renderPlayArea()`.
