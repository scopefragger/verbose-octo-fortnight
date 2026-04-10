# Architecture Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Single function handles two distinct zones via a boolean-style parameter
**Severity:** Low
**Lines:** 2042–2043
`showGraveViewer(zone)` uses the same function for both graveyard and exile by accepting a string parameter. This is a reasonable design for small differences, but the function contains two ternary expressions that duplicate the `zone === 'graveyard'` check. If a third zone were added (e.g., `'command'`), every ternary would need to be updated.
**Action:** This is acceptable for the current two-zone design. If more zones are added, refactor to a zone configuration object.

### Viewer renders on every open — no state check
**Severity:** Low
**Lines:** 2041–2054
The viewer re-renders all cards every time it is opened. If the graveyard is large, this is repeated DOM work. However, since graveyard contents change between opens (cards are added), caching would require invalidation logic.
**Action:** No action required for the current scale; this is acceptable for a single-player game tool.

### Inline empty-state style duplicated from other sections
**Severity:** Low
**Lines:** 2052
`'<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>'` is a repeated pattern across the play area renderer, graveyard viewer, and other sections. Each inline style is slightly different (`0.75rem`, `0.78rem`, `0.85rem`), creating visual inconsistency.
**Action:** Define a `.zone-empty-state` CSS class and use it consistently across all empty state placeholders.

## Summary
The section is a focused, single-purpose function with no major architectural issues. The empty-state inline style duplication is a recurring concern across the rendering sections.
