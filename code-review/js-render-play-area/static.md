# Static Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfc.card.power` and `bfc.card.toughness` values unescaped in innerHTML
**Severity:** Medium
**Lines:** 1898
`bfc.card.power` and `bfc.card.toughness` are interpolated directly into innerHTML without `escapeHtml()`. For Scryfall-sourced cards these are typically numeric strings, but for custom tokens entered by the user or loaded from saved data, they could contain arbitrary characters.
**Action:** Wrap both values with `escapeHtml()`: `` `<div class="tok-pt">${escapeHtml(String(bfc.card.power))}/${escapeHtml(String(bfc.card.toughness))}</div>` ``

### `bfc.card.type_line` substring unescaped in innerHTML
**Severity:** Medium
**Lines:** 1899
The expression `bfc.card.type_line?.split('—')[1]?.trim() || 'Token'` is interpolated into innerHTML without escaping. If `type_line` contains `<`, `>`, or `&`, this is an XSS vector (particularly for custom tokens whose `type_line` is user-supplied).
**Action:** Wrap with `escapeHtml()`: `` escapeHtml(bfc.card.type_line?.split('—')[1]?.trim() || 'Token') ``

### `img` src attribute from API data not validated
**Severity:** Low
**Lines:** 1890, 1913
Image URLs (`bfc.card.image_uris?.small`, `card.image_uris?.normal`) come from Scryfall and are interpolated directly into `src` attributes. While not a JavaScript XSS risk (src doesn't execute script), a `javascript:` URI would be blocked by browsers in img src context, so this is low risk.
**Action:** No immediate change required, but document that image URLs are trusted from Scryfall API responses.

### `bfc.card.colors` used without null guard in `tokenColorClass`
**Severity:** Low
**Lines:** 1877–1880
`tokenColorClass` uses optional chaining (`colors?.length`), which correctly handles `undefined`/`null`. However, the CSS class generated is `tok-` + the first color code without further validation. If `colors[0]` is an unexpected value, an invalid CSS class is generated (harmless but silently wrong).
**Action:** Validate that `colors[0]` is one of the known MANA_COLORS values, or fall back to `tok-C` for unknown color codes.

### `renderPlayHand` updates `play-hand-count` redundantly with `renderPlayArea`
**Severity:** Low
**Lines:** 1862, 1907
Both `renderPlayArea` (line 1862 via `renderPlayHand`) and `renderPlayHand` itself (line 1907) set `play-hand-count` textContent. This double-write is harmless but redundant.
**Action:** Remove the `play-hand-count` update from `renderPlayHand` since `renderPlayArea` handles it, or accept the redundancy with a comment.

## Summary
The most notable static issues are the unescaped `power`, `toughness`, and `type_line` values interpolated into innerHTML — these are real XSS vectors for custom user-created tokens. The remaining issues are low-severity robustness concerns.
