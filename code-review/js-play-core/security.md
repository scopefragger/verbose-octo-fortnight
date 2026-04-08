# Security Review — Play Core
Lines: 1664–1841 | File: public/mtg-commander.html

## Findings

### Inline `onclick` in `showManaChoicePicker` passes `color` without escaping
**Severity:** High
**Lines:** 1775–1776
`color` values are sourced from `manaColors`, which in turn come from `Object.keys(getLandMana(card))`. For normal Scryfall cards, `produced_mana` contains single uppercase letters (`W`, `U`, `B`, `R`, `G`, `C`). However, if a card's `produced_mana` array or the fallback type-line parsing ever returns a value containing a single quote or other shell-special character, the string is interpolated directly into the `onclick` attribute without escaping:

```js
return `<button ... onclick="tapCard(${idStr},'${color}');closeFocusPanel()">${color}</button>`;
```

A crafted Scryfall response (e.g., via a man-in-the-middle or a future change in API response shape) could inject arbitrary JS. The `color` value is also rendered as button text (`>${color}</button>`) without HTML escaping.
**Action:** Wrap `color` in `escapeHtml()` for the button text content. For the `onclick` attribute, either use `escapeQuotes(color)` or, better, build the buttons via DOM manipulation instead of innerHTML so no string interpolation into event handlers is needed.

### `showManaChoicePicker` injects card data into DOM without full escaping
**Severity:** Medium
**Lines:** 1785–1788
The function writes card fields directly to DOM element `textContent`, which is safe for XSS (textContent does not parse HTML). However, line 1792 appends `' — tap for:'` to `focus-name.textContent` directly — this is also safe but only because it uses `.textContent` and not `.innerHTML`. This is consistent with good practice, but the function on line 1793 sets `focus-actions.innerHTML` with the `colorBtns` string which has the unescaped `color` issue described above.
**Action:** No additional action beyond the `color` escaping issue noted above; confirm `.textContent` use is preserved for all card data fields.

### `id` passed as `JSON.stringify(id)` into inline `onclick` — safe but fragile
**Severity:** Low
**Lines:** 1772, 1776
`id` is `Date.now() + Math.random()`, which evaluates to a float like `1712345678901.4567`. `JSON.stringify` of a number produces a numeric literal, which is safe in an onclick attribute. The approach is correct but implicit — if `id` were ever changed to a string type (e.g., a UUID), the `JSON.stringify` would produce a quoted string that would need to be correctly escaped to avoid XSS.
**Action:** Add a comment noting the `id` type assumption, or switch to a data-attribute + event delegation pattern to remove the `onclick` string interpolation entirely.

## Summary
The principal security risk is in `showManaChoicePicker`, where `color` strings sourced from Scryfall's `produced_mana` are interpolated into `onclick` attribute strings and into button inner text without HTML or quote escaping. Under normal Scryfall responses this is safe, but it violates the project's own XSS-prevention rule (use `esc()` / `escapeHtml()` before interpolating into HTML). This should be fixed immediately to be consistent with the codebase's security standard.
