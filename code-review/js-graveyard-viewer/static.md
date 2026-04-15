# Static Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `zone` parameter is a free string with no validation
**Severity:** Low
**Lines:** 2041–2042
`showGraveViewer(zone)` accepts any string. If called with an unexpected value (not `'graveyard'`), it silently falls through to `playExile`. This makes the function's behavior surprising: any non-`'graveyard'` value (including typos like `'exile '`) defaults to exile without error.
**Action:** Add explicit validation: `if (zone !== 'graveyard' && zone !== 'exile') return;` at the start of the function, or use a ternary with an explicit fallback and a `console.warn` for unknown zones.

### `showCardDetail` called with `escapeQuotes(card.name)` in onclick — partial mitigation
**Severity:** Medium
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` uses `escapeQuotes` to escape single quotes in the card name. This prevents breaking out of the single-quoted JS string argument but does not protect against other HTML injection in the attribute itself. `card.name` from Scryfall is generally safe, but for tokens whose `name` is user-supplied, backslash sequences or other characters could be exploited.
**Action:** Use a data-attribute approach: store the card name in `data-card-name` and retrieve it in a non-inline event handler, or use `JSON.stringify(card.name)` with double-quote delimiters inside the onclick to ensure proper JS string quoting.

### Image URL fallback logic duplicated again
**Severity:** Low
**Lines:** 2046
The pattern `card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` appears for the fourth time in the file (also at lines 1883, 1913, 1935, 1972). No shared utility function has been extracted.
**Action:** Extract a `getCardImageUrl(card, size)` utility (flagged in multiple other sections). Use it here.

### No mechanism to close the graveyard viewer modal from within `showGraveViewer`
**Severity:** Low
**Lines:** 2040–2054
`showGraveViewer` opens the modal but the close functionality must be provided by the HTML (a close button or backdrop click handler defined elsewhere). There is no corresponding `closeGraveViewer()` function in this section. If the close function is inline HTML, it should be documented.
**Action:** Add a `closeGraveViewer()` function to this section for completeness, or add a comment referencing where the close logic lives.

## Summary
The graveyard viewer is a small, focused function with two notable issues: the `zone` parameter lacks validation (defaulting silently to exile for unknown values), and `escapeQuotes` alone is insufficient for safely embedding user-supplied card names in onclick attribute strings.
