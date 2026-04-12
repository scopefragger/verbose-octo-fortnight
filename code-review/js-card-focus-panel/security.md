# Security Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### XSS via `card.mana_cost` injected into `innerHTML` button label
**Severity:** High
**Lines:** 1983, 1986–1991
`card.mana_cost` is a value fetched from the Scryfall API and stored in app state. It is interpolated directly into `innerHTML` without escaping in the play button label:
```js
const playLabel = isLand ? '▶ Play Land' : `▶ Play ${card.mana_cost || ''}`;
document.getElementById('focus-actions').innerHTML = `
  <button ... >${playLabel}</button>
```
If Scryfall data were ever tampered with or replaced by a malicious local state value, this would execute injected HTML/script.
**Action:** Use `escapeHtml(card.mana_cost)` (the utility already exists in this file) before interpolating into the `innerHTML` template. Alternatively, build the button via `createElement` and set `textContent`.

### `onclick` with `JSON.stringify(id)` — potential injection if id is not a primitive
**Severity:** Medium
**Lines:** 1945–1951
`const idStr = JSON.stringify(id)` is used to safely embed `id` into `onclick` attributes. This is a reasonable approach for string/number ids, but if `id` ever becomes an object with a custom `toJSON()` or contains characters that break the JS literal context (e.g. `</script>` in a string id), it could result in injection.
**Action:** Assert that `id` is a string or number before using it in `onclick` attributes, or prefer `data-*` attributes + event delegation to avoid inline `onclick` handlers entirely.

### `idx` passed directly as a JS expression in `onclick` without sanitisation
**Severity:** Medium
**Lines:** 1988–1990
The hand card index `idx` is a function parameter used directly inside `onclick="playHandCardFromFocus(${idx})"` without validation or quoting. Although `idx` is expected to be a number derived from an array index call, if it were ever a non-numeric value (e.g. from a tampered call), it could inject arbitrary JS.
**Action:** Validate that `idx` is a non-negative integer before using it in inline event handlers. Consider using `data-idx="${idx}"` attributes with a delegated event listener instead.

### `focus-img` `src` set from Scryfall API data without validation
**Severity:** Low
**Lines:** 1937, 1976
`document.getElementById('focus-img').src = img` sets the image source to a URL from API-derived state. While this cannot execute scripts directly, a `javascript:` URI would execute if somehow injected.
**Action:** Validate that `img` starts with `https://` before assigning to `.src`, or use a URL allowlist check for the Scryfall CDN domain.

## Summary
The most significant risk is XSS via unescaped `card.mana_cost` injected into `innerHTML`. The inline `onclick` patterns with direct value interpolation are a recurring concern across the file and should be migrated to event delegation with `data-*` attributes. The image src assignment risk is low but should be guarded.
