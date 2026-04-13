# Code & Pattern Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Heavy inline styles in `renderPlayHand` card cost overlay
**Severity:** Low
**Lines:** 1920
The mana cost overlay `<div>` has a large inline style block: `style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:...;font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700"`. This mixes presentation with logic and duplicates styles that should be in a CSS class.
**Action:** Extract to a CSS class `play-hand-cost-pip` (with a modifier for `affordable` vs `unaffordable`) and replace the inline style with a class name.

### Fallback "Empty" and "No lands played" messages use inline styles
**Severity:** Low
**Lines:** 1873–1874
`style="color:var(--text-dim);font-size:0.75rem;padding:4px"` is repeated inline. Similar placeholder patterns exist elsewhere. A reusable `.empty-state` CSS class would unify these.
**Action:** Create a `.empty-state` utility class in the CSS section and use it here.

### `bfCardHTML` does not differentiate between cards and tokens in the outermost div
**Severity:** Low
**Lines:** 1889, 1895
Both card-image and card-text variants produce `<div class="bf-wrap...">` with an onclick. The function handles two distinct rendering paths (image vs. text/token) in a single function. This is acceptable but could be split into `bfCardImgHTML` and `bfTokenHTML` for clarity.
**Action:** No immediate action required; document the branching logic with a comment.

### `renderPlayHand` "No cards in hand" uses inline style
**Severity:** Low
**Lines:** 1909
`style="color:var(--text-dim);font-size:0.78rem;padding:8px 0"` — another inline style that belongs in a CSS class.
**Action:** Extract to the `.empty-state` class mentioned above or a `.play-hand-empty` class.

## Summary
The render functions work correctly but accumulate significant inline styling that belongs in CSS. The cost pip overlay on hand cards is particularly egregious. Extracting these to named CSS classes would improve maintainability and allow global theming.
