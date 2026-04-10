# Code & Pattern Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused computed variable `pt`
**Severity:** Low
**Lines:** 2027
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is computed but never included in the button label. It appears the developer intended to show power/toughness in the button but forgot to include `${pt}` in the return string. This is dead code that also represents a missing UX feature.
**Action:** Either include `${pt}` in the button label (likely intended), or remove the variable.

### Modal open/close uses `classList.remove('hidden')` / `classList.add('hidden')`
**Severity:** Low
**Lines:** 2031, 2036
The token modal uses `classList.remove('hidden')` and `classList.add('hidden')` for visibility, while the focus panel uses `classList.add('visible')` and `classList.remove('visible')`. These are opposite conventions — one hides by default with a `hidden` class, the other shows by default with a `visible` class. This inconsistency makes the codebase harder to reason about.
**Action:** Standardise on one pattern across all modals. The `visible` class approach (where elements are hidden by default in CSS and shown by adding `.visible`) is generally cleaner.

### ✈ emoji for Flying keyword
**Severity:** Low
**Lines:** 2028
The Flying keyword is indicated by a ✈ (airplane) emoji. This is a playful choice but may not be immediately recognisable for all users. The official MTG symbol for Flying is a specific icon.
**Action:** Consider using text (`Flying`) or a more conventional symbol. This is a minor UX note.

## Summary
The most actionable pattern issue is the unused `pt` variable (which likely represents a missing feature: showing power/toughness in preset buttons) and the inconsistent modal open/close pattern compared to the focus panel. The `escapeHtml(JSON.stringify(...))` anti-pattern is addressed in the static and security reviews.
