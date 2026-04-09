# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Zone title uses emoji directly in `textContent` — acceptable
**Severity:** Info
**Lines:** 2043
`document.getElementById('grave-viewer-title').textContent = zone === 'graveyard' ? '🪦 Graveyard' : '✨ Exile'` uses emoji in a `textContent` assignment, which is safe (no injection risk) and consistent with other zone labels in the file. This is acceptable.
**Action:** No action required.

### `zone` parameter string literals duplicated across callers and this function
**Severity:** Low
**Lines:** 2042–2043
The strings `'graveyard'` and `'exile'` appear as magic strings both inside `showGraveViewer` and in the HTML onclick handlers that call it. If the zone naming is ever changed, all callsites must be updated.
**Action:** Define zone name constants shared between the function and its callers, or document the accepted values in a JSDoc comment: `@param {'graveyard'|'exile'} zone`.

### Card image fallback to text label is consistent with other viewer patterns
**Severity:** Info
**Lines:** 2048–2050
The `img ? <img> : <div class="grave-viewer-card-text">` pattern is consistent with how `bfCardHTML` and `renderPlayHand` handle missing images. This is a good consistency.
**Action:** No action required.

## Summary
The graveyard viewer patterns are largely consistent with the rest of the file. The main improvement would be documenting or extracting the accepted `zone` string values as constants to avoid magic string drift between the function and its callers.
