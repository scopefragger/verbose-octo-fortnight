# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Inline styles for the mana cost overlay in `renderPlayHand`
**Severity:** Low
**Lines:** 1920
The mana cost display overlay uses a long inline style string: `style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:${...};font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700"`. This duplicates visual styling that belongs in CSS and must be edited in JavaScript source rather than a stylesheet.
**Action:** Extract to a CSS class (e.g. `.hand-card-cost-badge`) with a separate `--badge-color` CSS variable for the affordability color.

### `loading="lazy"` on hand card images but not battlefield card images
**Severity:** Low
**Lines:** 1890, 1918
`renderPlayHand` uses `loading="lazy"` on card images (line 1918) but `bfCardHTML` (which renders battlefield cards) does not. This is an inconsistency — battlefield cards are also rendered dynamically and could benefit from lazy loading if there are many of them.
**Action:** Add `loading="lazy"` to the `<img>` tag in `bfCardHTML`.

### Zone labels `'perm'` and `'land'` are magic strings
**Severity:** Low
**Lines:** 1871–1872
The zone identifiers `'perm'` and `'land'` are string literals. These same strings likely appear in the play-core section (where cards are placed onto the battlefield). If the zone naming scheme changes, both locations must be updated.
**Action:** Define `const BF_ZONE = { PERM: 'perm', LAND: 'land' }` and use it in both this section and wherever zones are assigned.

## Summary
The render section has several inline style issues that should move to CSS, a lazy-loading inconsistency between hand and battlefield images, and magic zone strings that should be named constants. No critical pattern violations.
