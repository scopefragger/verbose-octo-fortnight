# Patterns Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline style on empty-state div instead of a CSS class
**Severity:** Low
**Lines:** 2052
`'<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>'` uses inline styles for the empty-state message. Both `color:var(--text-dim)` and the font-size hint at styles that belong in a CSS class (e.g. `.empty-state-label`).
**Action:** Define a `.empty-state-label` CSS class with these rules and use `<div class="empty-state-label">Empty</div>` instead.

### Zone title emoji hardcoded as string literals
**Severity:** Low
**Lines:** 2043
`'🪦 Graveyard'` and `'✨ Exile'` are hardcoded strings including emoji. These match the same emoji used in button labels elsewhere (e.g. `sendToGrave` / `sendToExile` button labels at lines 1950–1951). If the icons change, they must be updated in multiple places.
**Action:** Define zone display constants: `const ZONE_LABELS = { graveyard: '🪦 Graveyard', exile: '✨ Exile' };` and use `ZONE_LABELS[zone]` in `showGraveViewer` and wherever else zone labels appear.

### `classList.remove('hidden')` — consistent with token-modal pattern but not with focus-panel
**Severity:** Low
**Lines:** 2053
The graveyard viewer uses `classList.remove('hidden')` to show itself, consistent with the token modal. The focus panel uses `classList.add('visible')`. This dual convention means different elements have different default visibility states encoded in CSS, which is confusing.
**Action:** Standardise on one convention across all modals and viewers. Prefer `hidden` (class present = invisible, absent = visible) as it matches the natural default rendering behaviour.

### Image fallback renders a text div, but the two branches produce elements with different heights
**Severity:** Low
**Lines:** 2048–2049
When an image is present, an `<img>` is rendered; when absent, a `<div class="grave-viewer-card-text">` is rendered. These likely have different intrinsic sizes, which can cause layout shifts in the viewer grid if mixed cards (some with images, some without) appear together.
**Action:** Ensure `grave-viewer-card` has a fixed height/aspect ratio in CSS so both the image and text-fallback branches render in a consistent card-sized container.

### `showCardDetail` called with a plain name string — pattern inconsistent with card object usage elsewhere
**Severity:** Low
**Lines:** 2047
Other parts of the file pass full card objects to display functions. Here, only the name string is passed to `showCardDetail`, triggering a re-fetch. This is an inconsistency in how card data flows through the UI.
**Action:** Align with the architectural recommendation (see architecture.md) to pass the full card object and avoid the re-fetch.

## Summary
The main pattern issues are the inline style on the empty-state element, hardcoded zone label strings that duplicate values used elsewhere, and the inconsistent modal visibility convention. The image/text-fallback branch also risks layout inconsistency without a fixed card container size.
