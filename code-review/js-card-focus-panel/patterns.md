# Patterns Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline disabled-state style instead of CSS class
**Severity:** Low
**Lines:** 1984, 1987
```js
const playDisabledStyle = affordable ? '' : 'opacity:0.5;';
// ...
<button ... style="${playDisabledStyle}" ...>
```
The disabled visual is applied via inline `opacity:0.5` style. The project uses CSS classes for states elsewhere. Using a CSS class (e.g., `.btn-unaffordable`) would be consistent and easier to maintain.
**Action:** Add `.btn-unaffordable { opacity: 0.5; cursor: not-allowed; }` to the CSS section and toggle the class instead.

### `playTitle` built as a raw attribute string
**Severity:** Low
**Lines:** 1985, 1987
```js
const playTitle = affordable ? '' : 'title="Not enough mana"';
// ...
<button ... ${playTitle} ...>
```
Constructing raw HTML attribute strings is an unusual and fragile pattern. If the value ever needed to be user-supplied, it would immediately become an injection vector.
**Action:** Set the `title` attribute separately via JavaScript after building the button element, or always include the attribute and set its value conditionally: `title="${affordable ? '' : 'Not enough mana'}"`.

### Mixed `textContent` (safe) and `innerHTML` (risky) for card data
**Severity:** Low
**Lines:** 1939–1942 vs. 1946–1952
Card text fields (name, mana, type, oracle) are correctly set via `textContent`. Action buttons use `innerHTML`. The pattern is correct and consistent — `textContent` for data, `innerHTML` for UI structure — but the switch between the two could confuse a future developer editing this section.
**Action:** Add a brief comment: `// Use textContent for card data (safe); innerHTML only for action button markup`.

## Summary
No major pattern violations. The inline disabled-state style and raw-attribute-string pattern for `title` are minor inconsistencies with the rest of the file's CSS-class-based approach to visual states.
