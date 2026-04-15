# Architecture Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Single function handles both graveyard and exile display — implicit dual responsibility
**Severity:** Low
**Lines:** 2041–2042
`showGraveViewer` uses the `zone` parameter to select between `playGraveyard` and `playExile`. This is a reasonable approach for two similar zones, but the function silently conflates them. If exile ever needs different display behavior (e.g. different card actions, face-down cards), this branching will need to be extended throughout.
**Action:** No immediate change required. Add a comment documenting that this function intentionally handles both zones with identical display logic.

### Duplicated image URL fallback (fourth occurrence)
**Severity:** Medium
**Lines:** 2046
`card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal` appears here for the fourth time. This is a recurring architectural gap: no shared image URL utility exists.
**Action:** Create `getCardImageUrl(card, size = 'normal')` in the Utilities section and use it throughout. This has been flagged in Render Play Area and Card Focus Panel reviews as well.

### No `closeGraveViewer` function in this section
**Severity:** Low
**Lines:** 2040–2054
The open/close symmetry is broken: `showGraveViewer` is defined here but the close handler for `grave-viewer` modal is presumably in the HTML as a backdrop click handler or button with an inline `classList.add('hidden')`. There is no counterpart `closeGraveViewer()` JS function.
**Action:** Add a `closeGraveViewer()` function to make the section self-contained. Reference: the pattern used in Token Modal (`closeTokenModal`).

## Summary
The graveyard viewer is a compact, single-responsibility function with one architecture concern: the repeated image URL fallback pattern. Extracting a shared utility would fix this across multiple sections simultaneously.
