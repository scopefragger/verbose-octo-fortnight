# Patterns Review — Main Layout Wrapper
Lines: 785–965 | File: public/mtg-commander.html

## Findings

### Heavy inline styles on structural containers
**Severity:** Medium
**Lines:** 827, 833–834, 848, 851, 863, 867, 881–883, 891–893, 907, 910–912, 917–919, 938–939, 959
Numerous elements carry non-trivial inline `style` attributes — flex layout parameters, color values, font sizes, margin/padding values, border specifications, and display toggles — rather than CSS class names. Examples:
- Line 833: `style="display:flex;gap:8px;padding:8px 4px 10px;border-bottom:1px solid var(--card-border);margin-bottom:6px"`
- Line 891: A full block-level style string for the critique box with background, border, border-radius, and padding.
- Lines 863, 867: `max-width` constraints on chart sections.
This pattern duplicates presentational logic between CSS and HTML, makes theming changes require HTML edits, and creates inconsistency where semantically similar elements are sometimes styled via class and sometimes inline.
**Action:** Extract repeated or non-trivial inline styles into named CSS classes (e.g. `.deck-list-toolbar`, `.critique-box`, `.chart-section--colors`, `.chart-section--types`). Reserve inline styles for truly dynamic values set by JS.

### Magic color literals duplicated from CSS variables
**Severity:** Medium
**Lines:** 883, 891–892, 917–919
Several elements hardcode color values that appear to correspond to theme colors already defined as CSS variables elsewhere in the file:
- `rgba(160,112,224,0.08)` / `rgba(160,112,224,0.3)` / `#c084fc` (purple/AI critique theme) — lines 883, 891, 892
- `rgba(76,175,106,0.5)` / `#4caf6a` (green/token theme) — line 917
- `rgba(201,168,76,0.5)` / `var(--gold)` (gold/end-turn theme) — line 918
Using raw RGBA values inline instead of CSS variables means a color palette change requires hunting across HTML attributes rather than updating a single variable.
**Action:** Define CSS variables for the purple AI accent (`--color-ai`, `--color-ai-border`) and green token accent (`--color-token`, `--color-token-border`) and apply them via classes in the CSS block.

### `display:none` toggling via inline style as initial state
**Severity:** Low
**Lines:** 851, 881, 882, 883, 891, 910
Multiple elements use `style="display:none"` as their initial hidden state, mixing JS-toggled visibility into the HTML source. This creates two visibility mechanisms in parallel: CSS classes (`hidden`) used on some elements (lines 803, 807, 832, 841) and inline `style` used on others. The inconsistency makes it harder to audit which elements are hidden on load and which approach to use when adding new elements.
**Action:** Standardise on the `.hidden` CSS class for all initial hidden states. Use `style="display:none"` only for values set programmatically by JS at runtime (not in source HTML).

### Tooltip/hint text as bare inline content without semantic markup
**Severity:** Low
**Lines:** 821, 959
Hint strings like `"One card per line. Commander zone cards are auto-detected…"` (line 821) and `"· click card to play"` (line 959) are bare text inside divs or spans with no semantic role. They are presentational annotations that could benefit from a `<p class="hint">` or `aria-describedby` relationship to their associated control.
**Action:** Low priority — wrap in a consistent `.hint-text` class for styling hooks, and consider `aria-describedby` if accessibility matters.

### Comment quality is good; one section lacks a comment
**Severity:** Low
**Lines:** 898
The play area `<div class="play-area">` has a comment (`<!-- PLAY AREA -->`), but the internal `.play-controls` bar, `.grave-bar`, and `.play-hand-strip` sub-sections have no corresponding landmark comments, unlike the clearly annotated Left/Top-Right/Bottom-Right panels above.
**Action:** Add brief comments above `.play-controls`, `.grave-bar`, and `.play-hand-strip` for consistency with the rest of the block.

## Summary
The dominant pattern issue is inconsistent use of inline styles versus CSS classes — some structural containers use class-based styling while others carry full inline style blocks, and raw color literals are repeated in multiple places rather than using CSS variables. Standardising on the `.hidden` class for initial hidden states would also eliminate a parallel visibility mechanism. None of these issues affect runtime correctness; all are maintainability concerns.
