# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline `style` used to express affordability — should be a CSS class
**Severity:** Medium
**Lines:** 1984, 1987
`playDisabledStyle` is `'opacity:0.5;'` when a card is unaffordable, applied as an inline style on the Play button. Using inline styles for state-driven visual changes prevents CSS cascade overrides, makes theming harder, and is inconsistent with the rest of the UI which uses CSS classes (e.g. `.tapped`, `.selected`, `.hidden`) for state.
**Action:** Add a CSS class `.focus-btn--disabled` (or use the existing `disabled` attribute) and toggle the class rather than writing the inline style.

### `playTitle` as a raw attribute string — fragile template pattern
**Severity:** Low
**Lines:** 1985, 1987
`playTitle` is either `''` or the complete attribute string `title="Not enough mana"`. Mixing a conditional attribute with an interpolated template string is brittle — if `playTitle` is `''`, the template contains two consecutive spaces (`style="..." onclick=...`). Conditionally emitting attributes as raw strings is error-prone.
**Action:** Use a consistent pattern: always emit the `title` attribute and set it to an empty string when not needed, e.g. `title="${affordable ? '' : 'Not enough mana'}"`.

### Action button labels use emoji directly in source with no alt text or ARIA
**Severity:** Low
**Lines:** 1947–1951, 1989–1990
Buttons like `⟳ Untap`, `↷ Tap`, `🪦 Graveyard`, `✨ Exile` embed emoji directly. Screen readers will announce the emoji name (e.g. "headstone"), which may be confusing in context. There is no `aria-label` to provide a clean accessible label.
**Action:** Add `aria-label` attributes to each action button (e.g. `aria-label="Send to graveyard"`) to give screen readers meaningful labels independent of the emoji.

### Duplicated image-resolution pattern — no shared helper
**Severity:** Low
**Lines:** 1935, 1972
Both functions resolve the card image URL with the identical expression:
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''`
This same pattern appears elsewhere in the file (battlefield render, hand render). It is a prime candidate for a utility function.
**Action:** Extract to `getCardImageUrl(card, size = 'normal')` in the Utilities section and use it throughout.

### `idStr` variable introduced but used only in one block
**Severity:** Low
**Lines:** 1945–1951
`const idStr = JSON.stringify(id);` is computed then used only within the `focus-actions` innerHTML block five lines later. This is clean but could be inlined if the block is refactored to use data attributes.
**Action:** No immediate action; note this is pre-work that becomes redundant after the inline-onclick refactor recommended in the Security review.

### Magic string `'Token'` as fallback card name
**Severity:** Low
**Lines:** 1939
`card.name || 'Token'` is the only place in the panel where a fallback display name is given. Other panels use `card.name || ''`. The `'Token'` fallback is appropriate for the battlefield context (token cards have names) but constitutes a magic string that should be a named constant if reused.
**Action:** Define `const UNNAMED_TOKEN_LABEL = 'Token';` or ensure all token objects always have a `name` property (they do in `COMMON_TOKENS` and via `addToken`).

## Summary
The main pattern issue is the inline opacity style for affordability signalling, which should use a CSS class. The emoji-only button labels lack ARIA annotations, and the repeated image-URL resolution pattern should be extracted to a shared utility function. These are all low-to-medium severity improvements with no impact on current functionality.
