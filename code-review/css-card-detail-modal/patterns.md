# Code & Pattern Review — Card Detail Modal
Lines: 419–468 | File: public/mtg-commander.html

## Findings

### Magic number z-index: 100 with no shared z-index scale
**Severity:** Low
**Lines:** 447
`.modal-overlay` uses `z-index: 100`. Elsewhere in the file other overlays (context menu, token modal, graveyard viewer, card focus panel) each pick their own numeric z-index values independently. There is no documented z-index scale, so stacking order is only knowable by reading all the rules individually. If a new overlay is added, the author must manually scan for conflicts.
**Action:** Define CSS custom properties (e.g., `--z-modal: 100; --z-toast: 200;`) at the `:root` level and reference them consistently.

### Magic number for modal background hardcoded instead of using CSS variable
**Severity:** Low
**Lines:** 452
`.modal` uses `background: linear-gradient(135deg, #1a1230, #0f1a2e)` with literal hex values. The rest of the stylesheet uses CSS variables (`var(--card)`, `var(--card-border)`) for colors. This gradient is an inconsistent one-off that doesn't participate in any potential theme changes.
**Action:** Extract the gradient stop colors into CSS variables (e.g., `--modal-bg-start` / `--modal-bg-end`) or reuse existing surface variables.

### Inline style on modal HTML element mixing CSS concerns
**Severity:** Low
**Lines:** 1014 (HTML)
`<div class="modal" style="position:relative">` applies layout behavior inline that belongs in the stylesheet. This is a direct consequence of the `.modal-close` positioning issue noted in the static review, but it is also a pattern violation — every other layout property for `.modal` lives in the CSS block.
**Action:** Move `position: relative` into the `.modal` CSS rule.

### font-size values use both rem and unitless/px inline without system
**Severity:** Low
**Lines:** 461–467
Modal text classes mix `1.1rem`, `0.8rem`, `0.85rem`, `1.2rem` without a clear typographic scale. Values like `0.8rem` appear twice (`.modal-type` and `.modal-oracle`) which is consistent, but `1.2rem` for the close button icon is a one-off. The rest of the stylesheet uses similar ad-hoc rem values, so this is consistent with the broader file pattern rather than a local anomaly.
**Action:** No immediate action required; when/if a design-token system is introduced, include typographic scale variables.

### Close button uses a Unicode character (✕) instead of an SVG icon or CSS pseudo-element
**Severity:** Low
**Lines:** 1015 (HTML)
The close button content is a raw Unicode `✕` character in the HTML. This renders differently across OS/font stacks and cannot be styled independently of text. Other action icons in the app may use the same approach; if so this is a systemic pattern, but it is worth flagging for consistency.
**Action:** Replace with an SVG icon or a CSS-generated `::before`/`::after` cross for consistent cross-platform rendering.

## Summary
The main pattern issues are an undocumented z-index magic number, a hardcoded gradient that bypasses the CSS variable system, and a stray inline style. None of these cause functional bugs but they each make future maintenance slightly harder. All are low-severity and easy to address incrementally.
