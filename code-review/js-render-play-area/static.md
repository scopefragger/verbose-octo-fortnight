# Static Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `selectedBFId` referenced with `typeof` guard but global state is fragile
**Severity:** Medium
**Lines:** 1887
The expression `typeof selectedBFId !== 'undefined' && selectedBFId === bfc.id` implies `selectedBFId` may not always be declared. If it is a module-level or file-level variable, its initialisation should be explicit and consistent so the guard is unnecessary. If it is genuinely conditionally defined, all other call sites may also need the same guard.
**Action:** Initialise `selectedBFId` at the top of the play-mode state block (e.g. `let selectedBFId = null;`) and replace the `typeof` guard with a simple `selectedBFId === bfc.id` null check.

### `power` / `toughness` rendered without escaping
**Severity:** Medium
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into the HTML string without `escapeHtml()`. Although Scryfall returns numeric-looking strings, certain cards use `*` or `*+1` values, and any future data source could inject arbitrary content.
**Action:** Wrap both values with `escapeHtml()`: `${escapeHtml(String(bfc.card.power))}/${escapeHtml(String(bfc.card.toughness))}`.

### `type_line` split result used without null guard
**Severity:** Low
**Lines:** 1899
`bfc.card.type_line?.split('—')[1]?.trim()` uses optional chaining, so it is safe against a missing `type_line`. However, if `type_line` is present but contains no `—` separator, `split('—')[1]` is `undefined` and the `?.trim()` catches it — this is correct, but only because of the optional chain. The fallback `|| 'Token'` handles it. This is acceptable but could be made clearer.
**Action:** No fix required; consider extracting into a small helper `getSubtype(card)` for readability.

### `renderPlayHand` sets `play-hand-count` twice
**Severity:** Low
**Lines:** 1867, 1907
`renderPlayArea()` calls `renderPlayHand()`, and `renderPlayHand()` itself sets `play-hand-count` again (line 1907). `renderPlayArea()` also sets it directly (line 1867). The double-write is harmless but redundant and creates a confusion about which setter is authoritative.
**Action:** Remove the `play-hand-count` assignment from `renderPlayArea()` (line 1867) and let `renderPlayHand()` own it, since `renderPlayHand()` already has the correct value.

### `bfCardHTML` uses `JSON.stringify` for the `onclick` id
**Severity:** Low
**Lines:** 1884, 1889, 1895
`JSON.stringify(bfc.id)` is used to embed the id in an inline `onclick`. If `bfc.id` is a UUID string this produces `"\"uuid\""` in the HTML attribute, which works, but it is fragile if `id` ever changes type. `escapeQuotes` exists in the utilities section specifically for this purpose.
**Action:** Use `escapeQuotes(String(bfc.id))` (wrapping in quotes in the template) instead of `JSON.stringify`, consistent with other `onclick` patterns in the file.

## Summary
The section is mostly sound but has two unescaped interpolation points (`power`/`toughness`) that could become XSS vectors, a redundant double-write to the hand counter, and a `typeof` guard that signals improperly initialised global state. The `JSON.stringify`-for-onclick pattern is inconsistent with the `escapeQuotes` utility available elsewhere.
