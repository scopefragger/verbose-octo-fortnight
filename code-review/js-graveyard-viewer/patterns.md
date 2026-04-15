# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Emoji in `textContent` assignment — acceptable but inconsistent
**Severity:** Low
**Lines:** 2043
`zone === 'graveyard' ? '🪦 Graveyard' : '✨ Exile'` uses emoji in the title text assigned via `textContent`. This is consistent with emoji usage elsewhere in the file and safe (not HTML-injected). Fine for a family app.
**Action:** No change required. Note: if the app ever needs localization or text-only rendering, emoji in content strings add complexity.

### Magic string `'hidden'` for modal class toggle
**Severity:** Low
**Lines:** 2053
`classList.remove('hidden')` uses the magic string `'hidden'` as seen throughout the file. Consistent with other modal patterns but worth noting as a potential maintenance point.
**Action:** Accept as consistent with existing file conventions. No change required.

### Empty-state placeholder uses inline style
**Severity:** Low
**Lines:** 2052
`'<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>'` is an inline style for the empty state. This is the same pattern used in `renderBattlefield` (line 1873) and `renderPlayHand` (line 1909) with slightly different font sizes (`0.75rem` vs `0.85rem`), indicating inconsistency.
**Action:** Standardize the empty-state display across all three locations. Create a shared CSS class `.empty-placeholder` and use it instead of inline styles.

### `showCardDetail` called from onclick with card name — no pre-check
**Severity:** Low
**Lines:** 2047
If `showCardDetail` requires the card to exist in the current deck/search results, calling it from the graveyard/exile viewer with a token name (which may not be a real card) could produce an error or empty detail view. This depends on the `showCardDetail` implementation.
**Action:** Verify that `showCardDetail` gracefully handles names that are tokens or custom cards. Add a guard or use a different action for token cards (e.g. show focus panel instead of card detail).

## Summary
Pattern issues are minor: inconsistent empty-state font sizes and inline styles for placeholder content, and emoji in title strings. The main actionable item is creating a shared `.empty-placeholder` CSS class for consistency across the three empty-state occurrences.
