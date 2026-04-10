# Static Code Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `bfCardHTML` uses `JSON.stringify(bfc.id)` for onclick injection
**Severity:** Low
**Lines:** 1884, 1889, 1895
`bfc.id` is serialized via `JSON.stringify()` before being embedded in the `onclick` attribute. If `bfc.id` is a number this is safe, but if it is a string (e.g., a UUID), `JSON.stringify` wraps it in double quotes which are then inside a double-quoted HTML attribute — this will break the HTML. The surrounding `onclick="selectBFCard(${idStr})"` uses double quotes for the attribute, so a string id like `"abc-123"` would produce `onclick="selectBFCard("abc-123")"` which is invalid.
**Action:** If IDs are always numeric, this is fine. If IDs can be strings (UUIDs), wrap with single quotes: `` onclick="selectBFCard('${escapeQuotes(bfc.id)}')" `` instead of relying on `JSON.stringify`.

### `type_line` split and trim without null guard
**Severity:** Low
**Lines:** 1899
`` bfc.card.type_line?.split('—')[1]?.trim() || 'Token' `` uses optional chaining correctly, but if `type_line` contains no `—` character, `split` returns an array with one element and index `[1]` is `undefined` — which optional chaining catches via `?.trim()`. The final `|| 'Token'` fallback handles this. This is correct but not immediately obvious.
**Action:** Add a brief comment clarifying the fallback logic.

### `play-hand-count` updated in both `renderPlayArea()` and `renderPlayHand()`
**Severity:** Low
**Lines:** 1867, 1907
`play-hand-count` is set to `playHand.length` in both `renderPlayArea()` (line 1867) and `renderPlayHand()` (line 1907). Since `renderPlayArea` calls `renderPlayHand`, the element is written twice per `renderPlayArea` call.
**Action:** Remove the duplicate from `renderPlayArea()` and rely on `renderPlayHand()` to update it.

## Summary
The rendering functions are generally well-structured. The main static concerns are a potential ID quoting issue in `bfCardHTML` for string IDs and a duplicated element update for `play-hand-count`.
