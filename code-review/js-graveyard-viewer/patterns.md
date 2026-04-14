# Code & Pattern Review — Graveyard Viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Inline style for empty-state message
**Severity:** Low
**Lines:** 2052
`<div style="color:var(--text-dim);font-size:0.85rem">Empty</div>` — the same empty-state inline style pattern appears in multiple places across the render functions. As noted in the Render Play Area review, this should use a shared `.empty-state` CSS class.
**Action:** Use `<div class="empty-state">Empty</div>` and define the class once in CSS.

### Zone title uses emoji with no text-only fallback
**Severity:** Low
**Lines:** 2043
The graveyard title is `'🪦 Graveyard'` and exile title is `'✨ Exile'`. Emoji may render differently or not at all in some environments. For a personal family app this is acceptable, but the emoji are embedded in JS strings rather than HTML, making them harder to style.
**Action:** Define `ZONE_LABELS = { graveyard: '🪦 Graveyard', exile: '✨ Exile' }` as a constant and reference it in `showGraveViewer`. This at least centralises the labels.

### `showGraveViewer` always re-renders all cards on open
**Severity:** Low
**Lines:** 2044–2053
Like the token modal, the graveyard viewer rebuilds its card list on every open. While graveyard contents can change during play (so caching is less appropriate here), the render still processes images and generates HTML for every card each time.
**Action:** Acceptable for typical graveyard sizes (< 40 cards). No change needed for current scale.

### `escapeQuotes` used instead of `JSON.stringify` in onclick
**Severity:** Medium
**Lines:** 2047
As flagged in the security review, `'${escapeQuotes(card.name)}'` is the wrong approach for safely embedding strings in inline JS event handlers. This is a pattern issue as well as a security issue.
**Action:** Use `${JSON.stringify(card.name)}` — this pattern should be applied consistently everywhere card names appear in onclick attributes across the file.

## Summary
The graveyard viewer is a short function with few pattern issues beyond the recurring inline-style-instead-of-CSS problem and the `escapeQuotes` vs `JSON.stringify` onclick embedding pattern. These two issues appear throughout the file and represent systemic patterns that should be fixed everywhere rather than just here.
