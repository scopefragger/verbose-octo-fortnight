# Static Review — Graveyard Bar
Lines: 696–706 | File: public/mtg-commander.html

## Findings
### CSS custom property references are unverified in this segment
**Severity:** Low
**Lines:** 699, 702, 703, 706
`var(--card-border)`, `var(--text-dim)`, and `var(--gold)` are referenced but defined elsewhere in the stylesheet. If any of these variables were renamed or removed, the graveyard bar would silently fall back to the browser default (typically transparent/inherit) with no parse error. This is a general risk in single-file apps where all CSS lives in one `<style>` block and there is no linting step.
**Action:** Confirm all three custom properties are declared in the `:root` block. A brief comment or a linting rule (e.g., `postcss-custom-properties`) would catch stale references at build time.

### `.grave-btn` has no disabled state defined
**Severity:** Low
**Lines:** 701–705
The button rule covers the default and `:hover` states but defines no `[disabled]` or `.disabled` selector. If the JS ever disables a `.grave-btn` (e.g., when no cards are in the graveyard), it will retain full pointer-cursor and hover effects, giving the user no visual feedback that the button is inactive.
**Action:** Add a `.grave-btn:disabled` / `.grave-btn[disabled]` rule that sets `opacity: 0.4; cursor: not-allowed;` and suppresses the hover transition.

## Summary
The segment is clean CSS with no undefined identifiers or dead rules. Two low-severity gaps exist: unguarded custom-property references that could silently break visual rendering if variables are ever renamed, and a missing disabled-state rule for `.grave-btn` that would leave disabled buttons looking interactive.
