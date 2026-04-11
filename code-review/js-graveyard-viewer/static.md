# Static Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### No close function — close is handled via inline onclick in HTML
**Severity:** Low
**Lines:** 2053 (showGraveViewer), HTML line 1002–1004
`showGraveViewer` opens the modal, but closing it relies entirely on inline `onclick` attributes in the HTML (`document.getElementById('grave-viewer').classList.add('hidden')`). There is no matching `closeGraveViewer()` function.
**Action:** Define a `closeGraveViewer()` function to centralise the close logic, especially if close behaviour needs to add cleanup later (e.g., clearing innerHTML).

### `zone` argument is a raw string with no validation
**Severity:** Low
**Lines:** 2042
`showGraveViewer(zone)` branches on `zone === 'graveyard'`, defaulting to exile for any other value. If called with an unexpected zone string, it silently shows the exile pile.
**Action:** Add an explicit check: `if (zone !== 'graveyard' && zone !== 'exile') return;` or log a warning for invalid zone values.

### Empty state uses inline style rather than CSS class
**Severity:** Low
**Lines:** 2052
The empty state `<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>` is inline-styled. This duplicates the pattern seen in `renderBattlefield()` and `renderPlayHand()` throughout the file.
**Action:** Introduce a shared CSS class for empty zone indicators (e.g., `.zone-empty`) and use it here as well.

## Summary
The Graveyard Viewer is a small and focused function. The main issues are the lack of a close function counterpart, the unchecked zone string, and the repeated inline empty-state style pattern.
