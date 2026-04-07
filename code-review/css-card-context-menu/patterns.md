# Patterns Review — Card Context Menu
Lines: 647–658 | File: public/mtg-commander.html

## Findings
### Magic numbers throughout layout properties
**Severity:** Low
**Lines:** 649–654
Several values lack ties to design tokens or variables: `border-radius: 8px`, `z-index: 200`, `box-shadow: 0 8px 24px rgba(0,0,0,0.7)`, `min-width: 140px`, `padding: 8px 14px`, `font-size: 0.82rem`, `transition: background 0.15s`. None of these are fatal, but they are one-offs that may diverge from similar values used in other components (e.g., the focus panel at lines 660–695 likely also has border-radius, z-index, and box-shadow values).
**Action:** Extract recurring values (`--radius-md`, `--z-menu`, `--shadow-overlay`) as CSS custom properties in `:root` so the design system is consistent across components.

### Multiple declarations crammed onto single lines
**Severity:** Low
**Lines:** 649–651, 654–655
Each rule packs three to five declarations onto one line. This is a common space-saving pattern in single-file apps, but it increases diff noise and makes it harder to spot a changed property at a glance.
**Action:** If the file is ever refactored for readability, expand to one declaration per line. Not urgent given the single-file constraint.

### `z-index: 200` is an unanchored magic number in a flat stacking context
**Severity:** Low
**Lines:** 650
The value `200` is chosen to sit above other content, but there is no inventory of z-index values in the codebase. If another element is later assigned `z-index: 201` without checking, the menu will be obscured.
**Action:** Define named z-index tokens (e.g., `--z-menu: 200; --z-modal: 300;`) in `:root` so the stacking order is visible in one place.

## Summary
The segment is compact and functional. The main patterns concern is the proliferation of magic numbers (padding, font-size, border-radius, z-index, box-shadow) that are not tied to shared design tokens, which risks visual inconsistency as the single-file app grows. Line-packing is a minor readability trade-off acceptable in this context.
