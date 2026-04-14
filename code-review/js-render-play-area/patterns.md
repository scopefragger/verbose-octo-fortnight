# Code & Pattern Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Heavy inline styles in `renderPlayHand` (line 1920)
**Severity:** Medium
**Lines:** 1920
The mana cost overlay uses a long inline style string: `position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:...;font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700`. This is 10+ CSS declarations embedded in a JS template string.
**Action:** Extract to a CSS class `.hand-card-cost` and apply `affordable ? 'hand-card-cost' : 'hand-card-cost unaffordable'` with separate CSS color rules.

### `renderPlayArea` sets `library-count` as a string with " in library" suffix
**Severity:** Low
**Lines:** 1864
`${playLibrary.length} in library` is formatted inline. The " in library" label is presentation logic embedded in the render function. If the label changes (e.g., for localisation), it must be found in JavaScript rather than HTML.
**Action:** Move the label text to the HTML template and have the JS only set a numeric value: `document.getElementById('library-count').textContent = playLibrary.length`.

### Fallback empty-state strings use inline style instead of CSS class
**Severity:** Low
**Lines:** 1873–1874, 1909
Empty state divs use `style="color:var(--text-dim);font-size:..."` inline. The pattern appears multiple times across the file. A shared `.empty-state` CSS class would reduce repetition.
**Action:** Define `.empty-state { color: var(--text-dim); font-size: 0.75rem; padding: 4px; }` and reuse it.

### `renderPlayHand` card template uses `loading="lazy"` only on card images
**Severity:** Low
**Lines:** 1918
`loading="lazy"` is applied to hand card images. Battlefield card images in `bfCardHTML` (lines 1890) do not have `loading="lazy"`. Hand images use "normal" size (larger), while battlefield uses "small". Either both or neither should use lazy loading for consistency.
**Action:** Add `loading="lazy"` to battlefield card images in `bfCardHTML` for consistency.

## Summary
The render functions work correctly but contain significant amounts of inline CSS that belong in stylesheet classes. The mana cost overlay (line 1920) is the most egregious example. Extracting CSS to classes would improve maintainability and reduce HTML string complexity.
