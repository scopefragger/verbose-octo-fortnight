# Patterns Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline `style` attribute used for affordability instead of a CSS class
**Severity:** Low
**Lines:** 1984, 1987
`playDisabledStyle = affordable ? '' : 'opacity:0.5;'` injects an inline style to indicate the button is not usable. The project already has CSS classes for button states (e.g. `focus-btn`, `focus-btn primary`, `focus-btn danger`). An `unaffordable` or `disabled` CSS class should be used instead.
**Action:** Define a `.focus-btn.disabled` CSS rule with `opacity: 0.5; pointer-events: none;` and add/omit the class instead of using an inline style string.

### `playTitle` attribute string built via template literal without consistent quoting
**Severity:** Low
**Lines:** 1985
`const playTitle = affordable ? '' : 'title="Not enough mana"'` embeds a full HTML attribute string including its own quotes. This is inconsistent with how other attributes are handled in the template and is fragile — if the message ever contains a double-quote, it would break the HTML.
**Action:** Use a ternary directly in the template literal: `title="${affordable ? '' : 'Not enough mana'}"`. This is cleaner and consistent with standard HTML templating.

### Magic string `'Land'` repeated across functions
**Severity:** Low
**Lines:** 1973
`getCardType(card) === 'Land'` uses the magic string `'Land'`. This same comparison likely appears elsewhere in the file.
**Action:** Define a constant `const LAND_TYPE = 'Land'` in the state/constants section and reuse it across all comparisons.

### Tap/untap label uses raw Unicode arrows rather than consistent icon approach
**Severity:** Low
**Lines:** 1947
`${isTapped ? '⟳ Untap' : '↷ Tap'}` uses Unicode rotation symbols inline. Other buttons in the same template use emoji (🪦, ✨) and arrow characters (↩, ⬆, ▶). There is no consistent icon system.
**Action:** Document which icon type (emoji vs Unicode symbol vs text) is preferred for focus-panel buttons and apply it consistently. Low urgency but affects visual coherence.

### `selectBFCard` uses `JSON.stringify(id)` for onclick safety, but `selectHandCard` uses raw `idx`
**Severity:** Medium
**Lines:** 1945–1951 vs 1988–1990
`selectBFCard` uses `JSON.stringify(id)` to safely embed the card id, which is a defensive pattern. But `selectHandCard` embeds `idx` directly as a bare number with no equivalent safety step. This inconsistency suggests the patterns were written at different times.
**Action:** Apply the same pattern in both functions. For numeric indices, at minimum validate with `Number.isInteger(idx)` before interpolation. Preferably migrate both to `data-*` + event delegation.

## Summary
The section has several minor pattern inconsistencies: inline styles instead of CSS classes, inconsistent icon usage, and differing safety patterns between the two selection functions. None are blocking issues, but addressing them would improve consistency with the rest of the file. The most impactful fix is using a CSS class for the unaffordable button state rather than an inline style.
