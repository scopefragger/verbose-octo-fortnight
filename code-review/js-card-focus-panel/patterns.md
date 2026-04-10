# Code & Pattern Review — js-card-focus-panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Emoji in button labels embedded in JavaScript strings
**Severity:** Low
**Lines:** 1947–1951, 1989–1990
Button labels include emoji characters (⟳, ↷, 🪦, ✨, ▶, ↩, ⬆) embedded directly in JavaScript template literals that generate HTML. This is unconventional — emoji in code can cause encoding issues with some tools and is harder to search for or replace.
**Action:** This is acceptable for a single-file app, but consider using text labels or CSS content for consistency and searchability.

### Inline `opacity:0.5` style for disabled state instead of a class
**Severity:** Low
**Lines:** 1984, 1987
The unaffordable play button is visually disabled using an inline `style="${playDisabledStyle}"` where `playDisabledStyle = 'opacity:0.5;'`. This is a magic inline style that should be a CSS class (e.g., `.btn-disabled`).
**Action:** Add a `.btn-disabled` or `.focus-btn-disabled` CSS class and toggle it with a conditional class attribute.

### `playTitle` attribute written as raw string interpolation
**Severity:** Low
**Lines:** 1985, 1987
The tooltip is conditionally included as `${playTitle}` where `playTitle` is either `''` or `title="Not enough mana"`. Writing an entire attribute as a string variable is an unusual pattern that makes the HTML template harder to read.
**Action:** Use a conditional class or a ternary inside the attribute: `title="${affordable ? '' : 'Not enough mana'}"`.

### Double `getElementById` calls for `focus-img`
**Severity:** Low
**Lines:** 1937–1938, 1976–1977
`document.getElementById('focus-img')` is called twice consecutively to set `src` and `style.display`. This queries the DOM twice for the same element.
**Action:** Cache the element: `const focusImg = document.getElementById('focus-img'); focusImg.src = ...; focusImg.style.display = ...;`.

## Summary
The section has several minor pattern issues: inline styles for disabled state, unusual attribute-as-variable patterns, and duplicate DOM queries. Extracting shared panel population logic (noted in architecture) would also address most of these.
