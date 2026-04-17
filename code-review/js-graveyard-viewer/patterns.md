# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Empty-state placeholder uses inline style instead of a CSS class
**Severity:** Low
**Lines:** 2052
`'<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>'` uses an inline style. The same pattern appears in `renderBattlefield()` (lines 1873–1874) and `renderPlayHand()` (line 1909) with slightly different font sizes (`0.75rem`, `0.78rem`, `0.85rem`). The inconsistency and inline styles both suggest a missing shared CSS class.
**Action:** Define a `.empty-state-text` CSS class and use it consistently for all empty-state placeholders across the file.

### Repeated image-URL resolution expression — no shared utility function
**Severity:** Low
**Lines:** 2046
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` appears verbatim in at least five locations in the file. Extracting to `getCardImageUrl(card, size = 'normal')` would eliminate duplication (flagged in multiple prior reviews).
**Action:** Extract to a utility function in the Utilities section (line 2141) and replace all occurrences.

### `onclick` inline pattern inconsistent with `data-` attribute approach recommended for similar cases
**Severity:** Low
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` follows the same inline-JS pattern as the token modal preset buttons (flagged in the Token Modal security review). The same recommendation applies: use `data-card-name` attributes and a delegated listener to eliminate the escaping complexity and injection surface.
**Action:** Refactor to `data-card-name="${escapeHtml(card.name)}"` and attach a click listener on the container.

### Title text uses emoji directly rather than CSS-styled labels
**Severity:** Low
**Lines:** 2043
The viewer title is set to `'🪦 Graveyard'` or `'✨ Exile'` with emoji embedded in the string. This is consistent with the button labels at lines 952–953, so it is a cohesive pattern rather than an inconsistency. It is noted for completeness as an accessibility consideration (screen readers will announce emoji names).
**Action:** Low priority. Add `aria-label` attributes to the buttons at lines 952–953 if accessibility is a concern.

### Magic font-size value `0.85rem` not shared with other empty-state placeholders
**Severity:** Low
**Lines:** 2052
The `0.85rem` font size used here differs from the `0.75rem` used in the battlefield placeholders and `0.78rem` used in the hand placeholder. None of these values are defined as CSS variables or shared constants.
**Action:** Standardise all empty-state placeholder font sizes to a single CSS class value, removing the magic numbers.

## Summary
The graveyard viewer is concise and correct. All pattern issues are low severity and shared with findings raised in other sections: missing empty-state CSS class, duplicated image-URL resolution, and inline onclick escaping. Addressing these consistently across the file would have the highest impact.
