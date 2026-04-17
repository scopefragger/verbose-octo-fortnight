# Static Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### All three `getElementById` calls lack null guards
**Severity:** Medium
**Lines:** 2043, 2044, 2053
`getElementById('grave-viewer-title')`, `getElementById('grave-viewer-cards')`, and `getElementById('grave-viewer')` are all called without null checks. If any element is absent (HTML restructure, future conditional rendering), the function will throw a `TypeError` and leave the viewer in a partially-updated state.
**Action:** Cache the three element references at the top of the function and add an early-exit guard: `const viewer = document.getElementById('grave-viewer'); if (!viewer) return;`.

### `zone` parameter has no input validation — unknown values silently show exile
**Severity:** Low
**Lines:** 2042–2043
The `zone` parameter is checked with `=== 'graveyard'` and falls through to exile for any other value. If called with an unexpected string (e.g. `showGraveViewer('hand')` by mistake), it would silently display the exile zone and label it `'✨ Exile'`. The function has only two valid call sites (lines 952–953) both with correct strings, but there is no guard.
**Action:** Add an explicit validation: `if (zone !== 'graveyard' && zone !== 'exile') return;`, or use a lookup map `const ZONE_MAP = { graveyard: playGraveyard, exile: playExile };` and check `ZONE_MAP[zone]` before proceeding.

### Image URL resolution pattern is duplicated — no shared utility
**Severity:** Low
**Lines:** 2046
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` appears here without a fallback `|| ''`. Elsewhere (e.g. lines 1423, 1935, 1972) the same pattern includes `|| ''`. The inconsistency means `img` can be `undefined` in this function, and the conditional `img ?` check at line 2048 handles that correctly, but the pattern is inconsistent across the codebase.
**Action:** Extract to a shared `getCardImageUrl(card, size)` utility (already flagged in the Render Play Area review) and call it here with a `'normal'` size argument.

### No close function for the graveyard viewer — dismissal wired entirely in HTML
**Severity:** Low
**Lines:** 1002–1004
The viewer is closed by inline `onclick` attributes directly in the HTML (`document.getElementById('grave-viewer').classList.add('hidden')`). There is no corresponding JS function like `closeGraveViewer()`. This means the close logic is duplicated in two places in the HTML (the overlay click and the ✕ button) and cannot be called programmatically.
**Action:** Add a `closeGraveViewer()` function and update the HTML onclick attributes to call it, consistent with the pattern used by other modals (`closeModal`, `closeTokenModal`).

## Summary
The function is compact and correct for valid inputs. The main static concerns are the absence of null guards on DOM lookups and the lack of input validation on the `zone` parameter. The missing close function means the viewer's open/close lifecycle is split between JS and raw inline HTML.
