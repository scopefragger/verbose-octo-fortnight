# Static Code Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `zone` parameter is only validated by string equality — no fallback for unknown values
**Severity:** Low
**Lines:** 2042
`const cards = zone === 'graveyard' ? playGraveyard : playExile;` — if `zone` is passed any value other than `'graveyard'`, it silently falls through to `playExile`. A caller passing `zone = 'hand'` by mistake would display the exile pile as the graveyard.
**Action:** Add an explicit guard: `if (zone !== 'graveyard' && zone !== 'exile') return;` or use a lookup object `{ graveyard: playGraveyard, exile: playExile }[zone]`.

### `showCardDetail` called with `escapeQuotes(card.name)` — double-escaping risk
**Severity:** Low
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` uses `escapeQuotes` to escape single quotes in the card name before inserting into an onclick attribute. However `escapeQuotes` replaces `'` with `\'`, which is valid for inline JS but could cause issues if a card name contains a backslash. While no current MTG card names contain backslashes, this is a fragile pattern.
**Action:** Use a `data-name` attribute and a separate event listener to avoid any encoding concerns.

### No close button visible in the graveyard viewer modal
**Severity:** Low
**Lines:** 2040–2054
The `showGraveViewer` function opens the viewer modal (removes `hidden`), but there is no corresponding `closeGraveViewer` function in this segment. Verify that a close mechanism exists elsewhere (possibly in the HTML template).
**Action:** Confirm the close mechanism exists; if it's only a backdrop click, also add an Escape key listener for accessibility.

## Summary
The graveyard viewer is straightforward. The main concern is the silent fallback when `zone` is neither 'graveyard' nor 'exile', which could cause confusing behavior. The double-escaping risk for card names with backslashes is theoretical but worth noting.
