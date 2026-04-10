# Code & Pattern Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Emoji in `textContent` for zone labels
**Severity:** Low
**Lines:** 2043
Zone labels are set using `textContent` with emoji: `'🪦 Graveyard'` and `'✨ Exile'`. Using `textContent` for these is correct (no XSS risk), and the emoji adds visual distinction. However, it is inconsistent — some areas use text-only labels. This is a minor style note.
**Action:** No required change. Consider standardising emoji usage across all zone labels for consistency.

### Duplicate `zone === 'graveyard'` check
**Severity:** Low
**Lines:** 2042–2043
The condition `zone === 'graveyard'` is evaluated twice: once for selecting the card array and once for selecting the title text. A future developer might update one check but forget the other.
**Action:** Compute derived values from the zone parameter once: `const isGrave = zone === 'graveyard'; const cards = isGrave ? playGraveyard : playExile; const title = isGrave ? '🪦 Graveyard' : '✨ Exile';`.

### Inconsistent use of `classList.remove('hidden')` vs `classList.add('visible')`
**Severity:** Low
**Lines:** 2053
The graveyard viewer uses `classList.remove('hidden')` to show (same as the token modal) while the card focus panel uses `classList.add('visible')`. These are two different visibility conventions across the same codebase.
**Action:** Standardise all modals and viewers to use the same CSS class convention for show/hide.

## Summary
The function is concise and readable. The main pattern issues are the duplicate condition check and the inconsistency in modal visibility conventions across the file.
