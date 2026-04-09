# Static Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### `showGraveViewer` accepts any string for `zone` — no validation
**Severity:** Low
**Lines:** 2042
`const cards = zone === 'graveyard' ? playGraveyard : playExile;` silently falls through to `playExile` for any value other than `'graveyard'`. Passing an invalid zone string (e.g. `showGraveViewer('battlefield')`) will show exile contents with the incorrect title. There is no error or warning for unexpected values.
**Action:** Add a guard: `if (zone !== 'graveyard' && zone !== 'exile') return;` or use a switch with a default that logs an error.

### `showCardDetail` called in `onclick` but not defined in this section
**Severity:** Low
**Lines:** 2047
`onclick="showCardDetail('${escapeQuotes(card.name)}')"` references `showCardDetail`, which must be defined elsewhere in the file. If this function were removed or renamed, the onclick would silently fail. Cross-section references in a single-file app are unavoidable but should be noted.
**Action:** Add a comment: `// showCardDetail is defined in the card-detail-modal section`.

### Empty-state rendering uses an inline style instead of a CSS class
**Severity:** Low
**Lines:** 2052
The empty state renders `<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>` inline. This is inconsistent with using a shared CSS class for empty states elsewhere.
**Action:** Use a shared `.empty-state-hint` CSS class (also recommended in the render-play-area review).

## Summary
The graveyard viewer is a short, focused function. The main issues are the silent fallthrough for invalid zone values and the cross-section `showCardDetail` dependency that is not documented. Empty state styling inconsistency is a minor pattern issue.
