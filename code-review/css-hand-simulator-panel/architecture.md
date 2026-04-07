# Architecture Review — Hand Simulator Panel
Lines: 345–417 | File: public/mtg-commander.html

## Findings

### Critique Box Styled Entirely via Inline Styles in HTML
**Severity:** Medium
**Lines:** 891–893 (HTML), 345–417 (CSS block — absence)
The `#critique-box` panel is a logical part of the Hand Simulator Panel, yet all of its visual styling (background, border, border-radius, padding, font sizes, color, letter-spacing) is embedded as inline `style` attributes directly on the HTML elements. This splits the responsibility for styling the panel across two locations — the CSS block for `.hand-panel`, `.hand-toolbar`, `.hand-grid`, etc., and raw inline styles for the critique box. It makes the component harder to maintain (theme changes, responsive overrides, and dark-mode adjustments cannot reach inline styles via CSS selectors) and harder to audit.
**Action:** Move all inline styles from `#critique-box` and its children to named CSS classes within this CSS section.

### Button Visibility Managed Entirely via `style.display` in JS
**Severity:** Low
**Lines:** 881–883 (HTML), 1349–1352, 1372–1373 (JS)
The mulligan, keep, and critique buttons use `style.display = 'none'` / `''` scattered across four separate JS functions (`drawHand`, `mulligan`, `keepHand`, `critiqueHand`). Each function must independently track which buttons should be visible for a given state. There is no single source of truth for "which buttons are visible in state X". If a new state is added (e.g., "viewing a saved hand"), it is easy to miss one of the display toggles.
**Action:** Introduce a `setHandState(state)` function that centralises all button visibility transitions for states like `'idle'`, `'drawn'`, `'kept'`, `'critiquing'`.

### `mulligan` Logic Hardcodes Game Rules inline
**Severity:** Low
**Lines:** 1359, 1364–1367
The mulligan hand size formula (`Math.max(7 - mulliganCount, 1)`) and the label strings (`'6-card hand'`, `'5-card hand'`, etc.) are inline inside `mulligan()`. This couples game-rule logic with UI rendering logic. If the mulligan rule changes (e.g., London vs. Vancouver mulligan), both the size formula and the display string must be updated in lockstep.
**Action:** Extract the hand size formula into a named helper (e.g., `mulliganHandSize(count)`) and derive the label from it rather than using a hardcoded chain of string literals.

## Summary
The dominant architectural concern is that the critique box — a core part of this panel — is styled entirely outside the CSS block, blurring the separation between structure and presentation. Button visibility is also managed imperatively across multiple JS functions rather than through a unified state machine, increasing the risk of inconsistent UI states as the feature evolves.
