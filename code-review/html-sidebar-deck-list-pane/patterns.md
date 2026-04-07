# Patterns Review — Sidebar Deck List Pane
Lines: 832–838 | File: public/mtg-commander.html

## Findings

### Extensive inline styles on the button-bar wrapper div
**Severity:** Low
**Lines:** 833
The wrapper `<div>` on line 833 carries six inline style declarations: `display:flex`, `gap:8px`, `padding:8px 4px 10px`, `border-bottom:1px solid var(--card-border)`, and `margin-bottom:6px`. This is a dense inline style block for what is a reusable layout pattern (a bordered toolbar row). The gap, padding, and margin values are magic numbers with no named semantic (e.g., no CSS custom property or utility class explains why the bottom padding is `10px` vs `8px` for the sides). The border colour correctly uses a CSS variable, showing that the pattern was partially applied but not completed.
**Action:** Extract to a CSS class (e.g., `.pane-toolbar`) alongside the existing stylesheet declarations. Replace the three spacing magic numbers with CSS variables or consistent tokens to match the border-colour pattern already in use.

### `flex:1` on Save button only — asymmetric button sizing is undocumented
**Severity:** Low
**Lines:** 834–835
The Save button carries `style="flex:1"` as an inline style, causing it to expand to fill available space while the Edit button remains content-sized. This is a deliberate but undocumented layout choice. Because the style is inline and the Edit button has no compensating flex style, the asymmetry is invisible from the CSS file and easy to break if another button is added to the bar.
**Action:** Move `flex:1` into the `btn-gold` modifier or a dedicated `.btn-expand` utility class, and add a CSS comment explaining the intentional asymmetry.

### No accessible label or `aria-` annotation on the pane container
**Severity:** Low
**Lines:** 832
`<div class="deck-list-view hidden" id="pane-cards">` has no `role`, `aria-label`, or `aria-labelledby`. The three tab panes (import, cards, saved) function as a tabpanel pattern, but none carry ARIA tab roles. This is consistent with the rest of the sidebar — the issue exists across all panes, not uniquely here — but this segment is a natural place to note it.
**Action:** Add `role="tabpanel"` and `aria-labelledby` referencing the corresponding tab button to each pane div for screen-reader navigability.

## Summary
All three findings are low severity. The inline style density on line 833 is the most impactful to address, as it buries reusable spacing logic in the markup and makes future layout changes harder to apply consistently. The `flex:1` asymmetry and missing ARIA roles are minor polish items.
