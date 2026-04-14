# Static Code Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showCardDetail` called from graveyard viewer but may not be defined at this point
**Severity:** Low
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` calls `showCardDetail`. This function is defined at line 1435, which is earlier in the file, so it is in scope. However it is in the "prepare mode" section and fetches card details from Scryfall using the card name. In play mode, the card data is already in memory — calling out to Scryfall again is unnecessary.
**Action:** Consider using the already-loaded card data to populate the focus panel instead of re-fetching from Scryfall. Alternatively, pass the full card object via a data attribute and use a delegated listener.

### No way to return a card from graveyard/exile to hand or battlefield
**Severity:** Low
**Lines:** 2040–2054
The graveyard viewer renders cards and allows viewing card details, but provides no "return to hand" or "return to battlefield" action from within the viewer. This limits the play experience for graveyard recursion effects.
**Action:** Add action buttons per card in the graveyard viewer (e.g., "Return to Hand", "Return to Battlefield") wired to appropriate play-state mutation functions.

### Binary zone selection: only `'graveyard'` or anything-else maps to `playExile`
**Severity:** Low
**Lines:** 2042
`const cards = zone === 'graveyard' ? playGraveyard : playExile;` — any value other than `'graveyard'` maps to exile, including typos. There is no guard for invalid zone values.
**Action:** Add an explicit check: `if (zone !== 'graveyard' && zone !== 'exile') return;` at the start of the function.

## Summary
The graveyard viewer is minimal and mostly correct. The binary zone selection is fragile, and the viewer's utility is limited by the absence of card-return actions. The `showCardDetail` call triggers an unnecessary Scryfall fetch for data already in memory.
