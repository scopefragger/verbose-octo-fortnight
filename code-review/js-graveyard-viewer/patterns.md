# Code & Pattern Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline "Empty" placeholder uses inline style
**Severity:** Low
**Lines:** 2052
`<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>` is another inline style for an empty-state placeholder — the same pattern noted in the render-play-area review. This should use a shared `.empty-state` CSS class.
**Action:** Use a shared `.empty-state` CSS class as recommended in the render-play-area patterns review.

### `grave-viewer-title` set with emoji in string literals
**Severity:** Low
**Lines:** 2043
`'🪦 Graveyard'` and `'✨ Exile'` hardcode emoji into the title string. This is fine but inconsistent with any future internationalization or icon system.
**Action:** No change needed for the current scope. Note for future i18n work.

### Ternary inside `innerHTML` assignment spans multiple lines without clear delineation
**Severity:** Low
**Lines:** 2044–2052
The ternary operator `cards.length ? cards.map(...).join('') : '...'` is used inside an `innerHTML` assignment. While readable at this size, the deeply nested arrow function inside the ternary makes the structure harder to scan.
**Action:** Extract the card rendering to a named helper `graveCardHTML(card)` and simplify the ternary to `cards.map(graveCardHTML).join('')`.

## Summary
Minor pattern issues consistent with the rest of the file: inline styles, emoji in strings, and complex inline template literals. No high-impact issues in this segment from a patterns perspective.
