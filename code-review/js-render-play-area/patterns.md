# Patterns Review — js-render-play-area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### Inline styles for empty-state placeholders
**Severity:** Low
**Lines:** 1873, 1874, 1909
Empty-state messages use inline styles:
```js
'<div style="color:var(--text-dim);font-size:0.75rem;padding:4px">Empty</div>'
'<div style="color:var(--text-dim);font-size:0.78rem;padding:8px 0">No cards in hand</div>'
```
The file already has a CSS section for empty-state classes (`.empty-saved`). These should use a shared class.
**Action:** Add a `.empty-zone` CSS utility class and replace the inline styles.

### Mana cost badge uses a long inline style block
**Severity:** Low
**Lines:** 1920
The mana cost overlay badge is styled entirely inline:
```js
style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.75);color:${...};font-size:0.5rem;border-radius:3px;padding:1px 3px;font-weight:700"
```
This is a multi-property inline style that belongs in a CSS class (e.g., `.hand-cost-badge`), with only the dynamic `color` property left as an inline style or CSS variable.
**Action:** Extract static properties to `.hand-cost-badge` in the CSS section; keep only `color` inline or use CSS custom property.

### Duplicated card-wrap structure in `bfCardHTML`
**Severity:** Low
**Lines:** 1889–1902
The function has two `return` branches (image vs. token) that share identical outer `div.bf-wrap` and `onclick` markup but differ only in the inner content. This duplicates the wrapper and click-handler string.
**Action:** Build the inner content conditionally and wrap once:
```js
const inner = img ? `<img ...>` : `<div class="bf-token ...">...</div>`;
return `<div class="bf-wrap${selectedClass}" onclick="selectBFCard(${idStr})">${inner}...</div>`;
```

## Summary
Three cosmetic pattern issues: inline empty-state styles, a long inline style block for the mana badge, and duplicated wrapper markup in `bfCardHTML`. None affect functionality but all reduce maintainability.
