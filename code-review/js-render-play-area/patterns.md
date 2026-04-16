# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Inline styles in `renderBattlefield` empty-state divs
**Severity:** Low
**Lines:** 1873–1874
The empty-state placeholders use inline `style="color:var(--text-dim);font-size:0.75rem;padding:4px"`. The same pattern appears in `renderPlayHand` (line 1909: `style="color:var(--text-dim);font-size:0.78rem;padding:8px 0"`). These should be a shared CSS class (e.g. `.empty-state-hint`) to avoid magic values and ensure consistent styling.
**Action:** Define a `.empty-state-hint` CSS class in the stylesheet section and replace both inline style strings.

### Inline style block for the mana-cost overlay in `renderPlayHand`
**Severity:** Low
**Lines:** 1920
The mana cost affordability badge is rendered with a long inline style string including magic values (`rgba(0,0,0,0.75)`, `0.5rem`, `3px`, `1px 3px`, `700`). This makes it impossible to adjust from the CSS section and duplicates the kind of overlay pattern likely used elsewhere.
**Action:** Extract the badge into a CSS class pair: `.hand-cost-badge` (base) and `.hand-cost-badge--unaffordable` (red variant) and apply them via class logic in the template.

### `loading="lazy"` on hand card images but not battlefield card images
**Severity:** Low
**Lines:** 1890, 1918
`renderPlayHand` sets `loading="lazy"` on hand card images (line 1918) but `bfCardHTML` (which renders battlefield cards) does not (line 1890). The battlefield may have more cards than the hand. Lazy loading should be applied consistently.
**Action:** Add `loading="lazy"` to the `<img>` in `bfCardHTML`.

### Magic string `'perm'` and `'land'` for zone filtering
**Severity:** Low
**Lines:** 1871–1872
The zone values `'perm'` and `'land'` are magic strings. If either string needs changing (e.g. to `'permanent'`), all filter calls and the data-creation call sites must be updated in sync.
**Action:** Define zone constants at the top of the play-mode state block: `const ZONE = { PERM: 'perm', LAND: 'land' }` and replace the literals.

### Inconsistent font-size units in empty-state strings
**Severity:** Low
**Lines:** 1873, 1909
Battlefield empty state uses `font-size:0.75rem` and hand empty state uses `font-size:0.78rem`. The discrepancy is likely accidental and creates visual inconsistency.
**Action:** Standardise to `0.75rem` (or the design token value) in both empty states.

## Summary
The section relies heavily on inline styles with magic values, inconsistently applies lazy loading, and uses bare string literals for zone identifiers. These are polish and maintainability issues rather than functional bugs, but they accumulate tech debt across the rendering layer.
