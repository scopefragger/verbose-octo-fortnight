# Static Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### No null guard on `getElementById` calls
**Severity:** Low
**Lines:** 2043, 2044, 2053
All three `document.getElementById(...)` calls (`grave-viewer-title`, `grave-viewer-cards`, `grave-viewer`) are used without null checks. If any of these elements is absent from the DOM, the subsequent property access will throw a TypeError.
**Action:** Cache and guard the container element at the top of the function: `const viewer = document.getElementById('grave-viewer'); if (!viewer) return;`. Store the other two elements similarly.

### `zone` parameter has no validation — unrecognised values fall through silently
**Severity:** Low
**Lines:** 2042–2043
`showGraveViewer(zone)` uses a ternary that defaults to `playExile` for any value that is not `'graveyard'`. If called with a typo (e.g. `'Graveyard'` with a capital G, or `'exile zone'`), it silently renders the exile zone instead of failing visibly.
**Action:** Add an explicit check at the top: `if (zone !== 'graveyard' && zone !== 'exile') { console.warn('showGraveViewer: unknown zone', zone); return; }`.

### `playGraveyard` and `playExile` are implicit globals
**Severity:** Medium
**Lines:** 2042
Both state arrays are referenced without being declared in this section. Their declaration site is elsewhere in the file. If they are not initialised before `showGraveViewer` is called, the result is `undefined`, and `.length` would throw.
**Action:** Confirm both arrays are declared and initialised (e.g. `let playGraveyard = [];`) at the play-state block. Add a comment here noting the global dependency.

### `card.name` used without a fallback in `escapeQuotes` call
**Severity:** Low
**Lines:** 2047
`escapeQuotes(card.name)` is called without a null/undefined guard on `card.name`. `escapeQuotes` calls `String(str)`, so `undefined` becomes the literal string `"undefined"`, which would then be passed to `showCardDetail('undefined')` and result in a failed Scryfall lookup.
**Action:** Use `escapeQuotes(card.name || '')` and conditionally omit the onclick if the name is absent: only add the click handler when `card.name` is truthy.

## Summary
The function is concise and readable, but relies on unvalidated globals (`playGraveyard`, `playExile`) and lacks null guards on both DOM lookups and the `card.name` value. The silent fallthrough for unknown `zone` values is also worth making explicit.
