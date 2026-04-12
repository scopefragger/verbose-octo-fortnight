# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Inline styles for mana-cost overlay badge
**Severity:** Medium
**Lines:** 1920
The mana-cost affordability badge is rendered entirely with inline styles: `position:absolute`, `bottom:2px`, `right:2px`, `background:rgba(0,0,0,0.75)`, `font-size:0.5rem`, `border-radius:3px`, `padding:1px 3px`, `font-weight:700`. The colour is also hardcoded (`#e8d870` / `#e05555`). Equivalent patterns elsewhere in the file use CSS classes for layout and reserved only dynamic values for inline styles.
**Action:** Extract a CSS class (e.g. `.hand-cost-badge`) for the static layout properties and apply modifier classes (e.g. `.affordable` / `.unaffordable`) for the colour variants. Keep only the truly dynamic `color` in an inline style if needed, or use CSS custom properties set via JS.

### "Empty" and "No lands played" placeholder divs use inline styles
**Severity:** Low
**Lines:** 1873–1874
Empty-state placeholder elements use inline `style="color:var(--text-dim);font-size:0.75rem;padding:4px"`. The hand section (line 1909) uses the same pattern with a slightly different font size (`0.78rem`). These are inconsistent with each other and should share a CSS class.
**Action:** Add a `.play-area-empty-msg` (or equivalent) CSS class covering the shared properties. Use it for all three empty-state messages.

### Magic number font sizes and colours
**Severity:** Low
**Lines:** 1873, 1874, 1909, 1920
Literal values `0.75rem`, `0.78rem`, `4px`, `#e8d870`, `#e05555`, `rgba(0,0,0,0.75)` appear only in this section and are not defined as CSS variables. The existing CSS variable set (`--text-dim`, `--gold`, etc.) already provides a pattern for this.
**Action:** Define CSS variables for the mana-affordable (`--mana-ok`) and mana-unaffordable (`--mana-no`) colours. Consolidate the empty-state font size into a CSS class so it is defined once.

### Inconsistent image size selection between `bfCardHTML` and `renderPlayHand`
**Severity:** Low
**Lines:** 1883, 1913
`bfCardHTML` requests the `small` image URI; `renderPlayHand` requests `normal`. This is intentional given the different display sizes, but the asymmetry is not commented. A future developer maintaining one function might "normalize" both to the same size, inadvertently degrading performance or quality.
**Action:** Add a brief inline comment noting the deliberate size choice in each function, e.g. `// small variant — battlefield cards are displayed at thumbnail size`.

### `bfCardHTML` uses `JSON.stringify(bfc.id)` for safe `onclick` argument passing
**Severity:** Low
**Lines:** 1884, 1889, 1895
Using `JSON.stringify` to embed an ID into an `onclick` attribute is a valid pattern for numeric IDs (which these are — `Date.now() + Math.random()`). However, for hand cards (line 1917) a plain integer index `${i}` is used directly. The two approaches are consistent with their data types but the difference is not explained.
**Action:** Add a comment to `bfCardHTML` explaining why `JSON.stringify` is used (IDs are floats; string coercion would lose precision for very large values). This makes the pattern intentional rather than accidentally correct.

## Summary
The dominant pattern issue is the heavy use of inline styles for the mana-cost badge and empty-state messages, which conflicts with the rest of the file's CSS-class-based approach. Extracting two small CSS classes would clean up the generated HTML and make the styles easier to maintain. The other findings are documentation and minor consistency items.
