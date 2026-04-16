# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline `style` used for disabled-state instead of a CSS class
**Severity:** Low
**Lines:** 1984, 1987
`const playDisabledStyle = affordable ? '' : 'opacity:0.5;';` applies a magic opacity value as an inline style. There is almost certainly a `.disabled` or `.focus-btn--disabled` CSS pattern elsewhere in the file (or one should exist).
**Action:** Replace the inline style with a CSS class (e.g. `focus-btn--disabled`) and apply it conditionally: `class="focus-btn primary${affordable ? '' : ' focus-btn--disabled'}"`. Define the class in the CSS section.

### Magic string `'opacity:0.5;'` and bare `title` attribute injection
**Severity:** Low
**Lines:** 1984–1985
`const playTitle = affordable ? '' : 'title="Not enough mana"'` embeds a raw HTML attribute string into the template. If the title message ever needs to be dynamic, this pattern is fragile and easy to break with quoting issues.
**Action:** Use a ternary directly on the attribute: `title="${affordable ? '' : 'Not enough mana'}"`. This is safer and more idiomatic than toggling full attribute strings.

### Emoji used as action icons inconsistently
**Severity:** Low
**Lines:** 1947–1951, 1989
Some buttons use emoji (🪦, ✨) while others use Unicode arrows (⟳, ↷, ↩, ⬆). This creates a visually inconsistent button bar.
**Action:** Standardise icon usage across all focus-action buttons — either use a consistent emoji set or Unicode symbols throughout.

### `'Token'` hardcoded as fallback card name
**Severity:** Low
**Lines:** 1939
`card.name || 'Token'` uses `'Token'` as the fallback. This is a meaningful domain assumption: any card without a name is assumed to be a token. If non-token cards ever appear without names (e.g. from a corrupted deck save), the label would be misleading.
**Action:** Use a more neutral fallback like `'Unknown Card'` and handle the token case explicitly via `card.layout === 'token'` if needed.

### No comment explaining the `JSON.stringify(id)` pattern
**Severity:** Low
**Lines:** 1945
`const idStr = JSON.stringify(id);` is used to safely embed the card ID in an onclick attribute, but there is no comment explaining why `JSON.stringify` is used instead of direct interpolation.
**Action:** Add a one-line comment: `// JSON.stringify ensures the id is safely quoted in the onclick attribute`.

### `getCardType` called but not defined in this section
**Severity:** Low
**Lines:** 1973
`getCardType(card)` is called without any indication of where it is defined. A reader of this section alone cannot tell whether it is a utility, a global, or a missing function.
**Action:** Add a comment: `// getCardType() defined in Utilities section` or co-locate a reference to its source.

## Summary
The section follows the general patterns of the file but uses inline styles and raw attribute-string toggling for the disabled-play-button state where CSS classes would be cleaner. Icon inconsistency across action buttons is a minor polish issue. The `JSON.stringify(id)` safety pattern would benefit from a brief comment to communicate intent to future maintainers.
