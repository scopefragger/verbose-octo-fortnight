# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Heavy inline styles on the mana cost badge in `renderPlayHand()`
**Severity:** Medium
**Lines:** 1920
The mana cost badge is built entirely with inline styles:
`style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:...;font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700"`
This duplicates layout/visual rules that belong in CSS, makes the template literal hard to read, and cannot be overridden via the stylesheet.
**Action:** Extract to a CSS class (e.g. `.hand-cost-badge`) with a modifier for affordability (`.hand-cost-badge--unaffordable`), and replace the inline styles with class names.

### Empty-state placeholder strings use inline styles instead of CSS classes
**Severity:** Low
**Lines:** 1873, 1874, 1909
The "Empty", "No lands played", and "No cards in hand" placeholders each use inline `style="color:var(--text-dim);font-size:..."` attributes. The colour token `--text-dim` is already defined in the CSS, indicating a design system exists but is not being used here for layout.
**Action:** Create a shared CSS class (e.g. `.empty-state-text`) and use it in all three placeholders.

### Magic pixel values `4px`, `8px 0`, `0.75rem`, `0.78rem`, `0.5rem` in template literals
**Severity:** Low
**Lines:** 1873, 1874, 1909, 1920
Several spacing and font-size values are hard-coded as magic strings inside template literals. The values `0.75rem` and `0.78rem` are close enough to be confusing (intentionally different?).
**Action:** Move all values to CSS classes. If `0.78rem` vs `0.75rem` is intentional, add a comment; if not, normalise them.

### `bfCardHTML()` builds two near-identical HTML structures for the image and text-only card cases
**Severity:** Low
**Lines:** 1888–1902
The two return branches of `bfCardHTML()` share the outer `<div class="bf-wrap...">` wrapper and `onclick` attribute, differing only in the inner content. This duplication means any change to the wrapper (e.g. adding a new attribute) must be made in two places.
**Action:** Compute `innerContent` conditionally and emit the wrapper once:
```js
const inner = img ? `<img .../>...` : `<div class="bf-token...">...</div>`;
return `<div class="bf-wrap${selectedClass}" onclick="...">${inner}</div>`;
```

### `getCardType()` is called inside a render loop without memoisation
**Severity:** Low
**Lines:** 1914
`getCardType(card)` is called once per card per render of the hand. If the function is non-trivial (parsing `type_line` strings), calling it in a `.map()` loop is fine for small hands but worth noting. There is no caching of the computed type.
**Action:** Low priority for current hand sizes. If performance becomes a concern, cache `cardType` on the card object at play-time rather than recomputing each render.

## Summary
The most impactful pattern issue is the dense inline style block on the mana cost badge in `renderPlayHand()`, which should be extracted to CSS. The duplicated wrapper in `bfCardHTML()` and inconsistent empty-state placeholder styles are secondary concerns that reduce maintainability without causing bugs.
