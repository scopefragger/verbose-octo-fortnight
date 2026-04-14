# Code & Pattern Review — Card Focus Panel
Lines: 1925–1994 | File: public/mtg-commander.html

## Findings

### Inline style for `playDisabledStyle` instead of a CSS class
**Severity:** Low
**Lines:** 1984
`const playDisabledStyle = affordable ? '' : 'opacity:0.5;'` applies a disabled appearance via inline style. The rest of the codebase uses CSS classes for state. A `.btn-disabled` class would be more consistent and allow CSS transitions.
**Action:** Replace with `class="${affordable ? '' : 'btn-disabled'}"` and define `.btn-disabled { opacity: 0.5; cursor: not-allowed; }` in the stylesheet.

### `playTitle` uses `title` attribute for affordability hint
**Severity:** Low
**Lines:** 1985
`const playTitle = affordable ? '' : 'title="Not enough mana"'` — this injects a `title` attribute string into the template. Using `title` for functional feedback is inaccessible (screen readers may not announce it, mobile has no hover state).
**Action:** Consider adding a visible text hint or use `aria-disabled` with a tooltip-style CSS component.

### Action button labels use emoji for icons
**Severity:** Low
**Lines:** 1947–1951, 1988–1990
Emoji are used as icons in action buttons (⟳, ↷, ↩, ⬆, 🪦, ✨). This is consistent with the rest of the file's styling but emoji rendering varies across platforms and screen readers may announce them verbosely.
**Action:** Acceptable for a personal-use family app. If accessibility is a future concern, replace with SVG icons and `aria-label` attributes.

### Field population repeated identically for both BF and hand cards
**Severity:** Medium
**Lines:** 1935–1942, 1972–1981
Both `selectBFCard` and `selectHandCard` contain exactly the same 7 lines of DOM element assignments (`focus-img`, `focus-name`, `focus-mana`, `focus-type`, `focus-oracle`). This is copy-paste code.
**Action:** This overlaps with the architecture finding — extract to a shared `populateFocusPanel(card)` function.

## Summary
The section's pattern issues centre on inline styles instead of CSS classes for disabled state, duplicated DOM-setting code, and emoji-based icons. The most impactful improvement is extracting the shared focus panel population into a helper, which would clean up both patterns and architecture concerns simultaneously.
