# Static Code Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `zone` parameter accepts any value — silently defaults to exile
**Severity:** Low
**Lines:** 2042
`zone === 'graveyard'` falls through to exile for any non-`'graveyard'` value. Passing an invalid zone (e.g., `showGraveViewer('library')`) silently shows the exile list and labels it as exile. There is no validation or error for unknown zones.
**Action:** Add an explicit check: `if (zone !== 'graveyard' && zone !== 'exile') return;`. Or use a more explicit ternary with a default.

### No null guard on `grave-viewer` element
**Severity:** Low
**Lines:** 2053
`document.getElementById('grave-viewer').classList.remove('hidden')` does not guard against null. If the element is absent from the DOM, this will throw a TypeError.
**Action:** Add: `const viewer = document.getElementById('grave-viewer'); if (!viewer) return; viewer.classList.remove('hidden');`.

### No way to close the graveyard viewer from `showGraveViewer`
**Severity:** Low
**Lines:** 2040–2054
`showGraveViewer` only opens the viewer; there is no corresponding `closeGraveViewer` function in this section. It is presumably in the HTML with an onclick, but the close logic is not reviewed here.
**Action:** Verify that a close/dismiss mechanism exists in the HTML and is functional.

## Summary
The function is short and focused. The main static concern is the silent default for unknown `zone` values. The null guard on the viewer element is also missing.
