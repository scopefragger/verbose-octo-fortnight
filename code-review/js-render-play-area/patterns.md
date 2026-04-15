# Patterns Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Magic inline styles in `renderPlayHand` for the cost badge
**Severity:** Medium
**Lines:** 1920
The mana cost badge on hand cards uses a long inline style string with hardcoded values: `position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:${...};font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700`. This is a magic style block repeated in JS rather than a CSS class, making it invisible to the stylesheet and harder to maintain.
**Action:** Create CSS classes `.hand-cost-badge` and `.hand-cost-badge.affordable` / `.hand-cost-badge.unaffordable` and apply them via class names rather than inline styles. Alternatively, split into two classes: `.cost-badge-affordable` and `.cost-badge-unaffordable`.

### Magic string for "Empty" and "No lands played" placeholder text
**Severity:** Low
**Lines:** 1873–1874
Inline fallback HTML strings `'<div style="...">Empty</div>'` and `'<div style="...">No lands played</div>'` are magic strings embedded in JS. These are not easily localizable or consistently styled.
**Action:** Extract as named constants or use a shared `emptyPlaceholderHTML(text)` helper function consistent with the pattern used elsewhere in the file.

### Inconsistent image size requested for battlefield vs. hand
**Severity:** Low
**Lines:** 1883, 1913
Battlefield cards request `small` image size; hand cards request `normal` image size. This is probably intentional (hand cards are displayed larger), but there is no comment explaining the distinction.
**Action:** Add inline comments noting the deliberate size choice: `// small for compact battlefield display` and `// normal for larger hand card display`.

### Inline `loading="lazy"` only on hand cards, not battlefield images
**Severity:** Low
**Lines:** 1890, 1918
`loading="lazy"` is applied to hand card images (line 1918) but not to battlefield card images (line 1890). During play, many cards may be on the battlefield simultaneously, and lazy loading would reduce initial render cost.
**Action:** Add `loading="lazy"` to the battlefield image template in `bfCardHTML`.

## Summary
The primary pattern issue is the large inline style block for the affordability badge in hand cards — this should be a CSS class. The inconsistent lazy loading and size choices should be documented with comments or made consistent.
