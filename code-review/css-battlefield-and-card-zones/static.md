# Static Review — Battlefield & Card Zones
Lines: 581–636 | File: public/mtg-commander.html

## Findings

### Duplicate `.bf-wrap` rule block
**Severity:** Low
**Lines:** 597–601, 610
`.bf-wrap` is declared twice — once as a full block (lines 597–601) and again as a single-property rule (`cursor: pointer`) at line 610. The `cursor: pointer` on line 610 could have been included in the original block, making the second declaration dead weight that slightly inflates the stylesheet.
**Action:** Merge `cursor: pointer` into the primary `.bf-wrap` block at lines 597–601 and remove the duplicate selector at line 610.

### `.bf-token` `border` shorthand incomplete
**Severity:** Low
**Lines:** 624
`.bf-token` declares `border: 2px solid` with no color value. The color is then supplied by each `.tok-*` modifier class. While this works at runtime, any element that carries `.bf-token` without a color modifier will render with the browser's default border color (usually black), which may look wrong in a dark UI.
**Action:** Either set a safe fallback color (`border: 2px solid transparent`) or document the intentional dependency on a modifier class with a comment.

### `var(--gold)` reference not verifiable in this segment
**Severity:** Low
**Lines:** 613
`var(--gold)` is used in the `.bf-wrap.selected` rule. If the CSS custom property is not defined in the `:root` block elsewhere in the file, the selection outline will silently fall back to an invisible value. This cannot be confirmed in this segment alone.
**Action:** Verify `--gold` is declared in `:root` (or equivalent global scope) and add a fallback value: `var(--gold, #c9a84c)`.

## Summary
The segment is largely clean. The two-block `.bf-wrap` split is the most actionable static issue — it creates a maintenance trap where the `cursor` property is easy to overlook when editing the primary block. The borderless `.bf-token` base and unguarded `var(--gold)` are low-risk but worth tightening.
