# Code & Pattern Review — Saved Decks Tab
Lines: 257–278 | File: public/mtg-commander.html

## Findings

### Magic numbers for spacing and sizing
**Severity:** Low
**Lines:** 261, 268, 269, 270, 274, 275, 276, 277, 278
The segment uses raw numeric literals for padding (`10px`, `12px`, `14px`), margin (`8px`, `3px`), font sizes (`0.9rem`, `0.75rem`, `0.85rem`), gap (`6px`), and border-radius (`10px`). These are not drawn from CSS custom properties, unlike the color and background values which correctly use `var(--card)`, `var(--card-border)`, `var(--gold)`, and `var(--text-dim)`. The rest of the file uses `var(--...)` for semantic tokens but raw values for spacing, which is inconsistent.
**Action:** Consider defining spacing/sizing tokens (e.g. `--space-sm: 8px`, `--radius-card: 10px`) in the `:root` block and using them here for consistency and easier global theming.

### `transition: all 0.2s` is a performance anti-pattern
**Severity:** Low
**Lines:** 272
Using `transition: all` causes the browser to watch every animatable property on `.saved-deck-item` for changes, not just the intended `border-color` and `background`. This can trigger unnecessary composite/paint work if other properties change (e.g. during JS-driven updates).
**Action:** Replace with `transition: border-color 0.2s, background 0.2s;` to target only the properties that change on hover.

### `.empty-saved` is defined outside the "Saved Decks Tab" comment block
**Severity:** Low
**Lines:** 278
The `.empty-saved` rule (empty state message) is logically part of the saved-decks tab feature but is placed at the end of line 278 — the last line of the segment — which may cause it to be associated with the next section in future edits. The section comment on line 257 clearly groups lines 257–278, so this is minor, but the rule could be grouped with `.saved-deck-meta` more explicitly.
**Action:** No change required; note for future maintainers that `.empty-saved` belongs to this tab section.

## Summary
The segment follows the file's overall CSS patterns well, using CSS variables for colors. The main pattern issues are inconsistent use of magic numbers for spacing (vs. variables for colors), the broad `transition: all` shorthand, and no spacing/sizing tokens to match the color token system already in place.
