# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline `style` attribute used for affordability indicator
**Severity:** Low
**Lines:** 1984, 1987
`playDisabledStyle` applies `opacity:0.5` via an inline style attribute. A `disabled` attribute or a CSS class (e.g., `.btn-disabled`) would be more semantic and consistent with standard button patterns.
**Action:** Use a CSS class (e.g., `focus-btn--unaffordable`) and toggle it rather than injecting inline styles.

### `playTitle` attribute built as a raw HTML string fragment
**Severity:** Low
**Lines:** 1985, 1987
`playTitle` is set to either `''` or `title="Not enough mana"` and embedded directly into the template literal as a raw HTML attribute string. This is an unusual pattern — typically the attribute would be included with a conditional value.
**Action:** Prefer `title="${affordable ? '' : 'Not enough mana'}"` for clarity and robustness. As written, when `affordable` is true, no `title` attribute is present, which is technically fine but inconsistent.

### Emoji used as button icon labels without accessible text
**Severity:** Low
**Lines:** 1947–1951, 1989–1990
Buttons like `🪦 Graveyard`, `✨ Exile`, `↩ Hand` use emoji inline with text. While the text label is present, screen readers may announce the emoji name literally (e.g., "headstone"). An `aria-label` would help.
**Action:** Add `aria-label` attributes to action buttons where the emoji prefix may produce confusing accessible names.

### Identical card image fallback pattern repeated in two functions
**Severity:** Low
**Lines:** 1935, 1972
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''` is duplicated verbatim in both `selectBFCard` and `selectHandCard`. This pattern also appears in the render section.
**Action:** Extract to a utility function `getCardImageNormal(card)` to centralise this lookup.

### Focus panel always shown via class, never via `display`
**Severity:** Low (informational)
**Lines:** 1954, 1993
The panel becomes visible by adding the `visible` CSS class. This is consistent with the CSS pattern used elsewhere but should remain consistent — avoid mixing `display` toggles and class-based visibility for the same element.
**Action:** No immediate change needed; document this pattern for future contributors.

## Summary
The section follows the general patterns of the file but has opportunities for improvement: inline styles should become CSS classes, the image URI lookup should be extracted to a utility, and buttons could benefit from `aria-label` attributes for accessibility.
