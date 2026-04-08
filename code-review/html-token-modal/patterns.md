# Code & Pattern Review — Token Modal
Lines: 982–999 | File: public/mtg-commander.html

## Findings

### Inline Styles on Select Element
**Severity:** Low
**Lines:** 978

The select element uses inline styles for background, border, border-radius, padding, color, and font-size. These are already defined in CSS classes like `.token-custom input` (lines 757–761) but are overridden inline.

**Action:** Remove inline styles and reuse the existing CSS class structure:
```html
<select id="custom-token-color" class="token-custom-select">
```
Then add a CSS rule in the stylesheet (if needed):
```css
.token-custom select {
  flex: 1; background: var(--card); border: 1px solid var(--card-border);
  border-radius: 8px; padding: 7px 10px; color: var(--text); font-size: 0.85rem;
}
```

### Hardcoded Color Codes
**Severity:** Low
**Lines:** 979–984

The MTG color codes (W, U, B, R, G, C) are hardcoded in the HTML. There's no single source of truth for color definitions, making it hard to add a new token type or color variant.

**Action:** Define a constant at the top of the JavaScript section:
```js
const MTG_COLORS = [
  { code: 'W', name: 'White' },
  { code: 'U', name: 'Blue' },
  { code: 'B', name: 'Black' },
  { code: 'R', name: 'Red' },
  { code: 'G', name: 'Green' },
  { code: 'C', name: 'Colorless' }
];
```
Then generate the select options dynamically or reference this constant.

### Magic String 'Green' as Default
**Severity:** Low
**Lines:** 983

The select has `value="G" selected>Green</option>`, hardcoding Green as the default. There's no comment explaining why Green is preferred, and no constant for this default.

**Action:** Add a constant `const DEFAULT_TOKEN_COLOR = 'G'` and use it in both the HTML and in `closeTokenModal()` form reset. Document why Green is chosen (e.g., "Common default for creature tokens").

### Inconsistent Element Naming
**Severity:** Low
**Lines:** 974–978

Input IDs use inconsistent naming:
- `#custom-token-name` (kebab-case, good)
- `#custom-token-power` (kebab-case, good)
- `#custom-token-tough` (abbreviated, inconsistent with "toughness" in code comments)
- `#custom-token-color` (kebab-case, good)

**Action:** Rename `#custom-token-tough` to `#custom-token-toughness` for clarity and consistency. Update all references:
```html
<input id="custom-token-toughness" placeholder="Toughness" ... />
```
Update `addCustomToken()`:
```js
const toughness = document.getElementById('custom-token-toughness').value.trim() || null;
```

### Missing Placeholder Color Indicator
**Severity:** Low
**Lines:** 978–985

The color select has no visual indicator (e.g., a color swatch or emoji) next to each option. Users must remember that 'W' = White, 'U' = Blue, etc.

**Action:** Add color names as labels or emojis:
```html
<option value="W">⚪ White</option>
<option value="U">🔵 Blue</option>
<option value="B">⚫ Black</option>
<option value="R">🔴 Red</option>
<option value="G" selected>💚 Green</option>
<option value="C">⚪ Colorless</option>
```

### Unused Variable in bfCardHTML
**Severity:** Informational
**Lines:** 1884 (related function)

In `bfCardHTML()`, the line `const idStr = JSON.stringify(bfc.id)` uses `JSON.stringify()` on a numeric ID. This should just be a string concatenation:
```js
const idStr = String(bfc.id);
```

**Action:** Simplify the ID serialization. This is minor but improves clarity.

## Summary

The code follows the general patterns of the file but uses inline styles, hardcoded values, and inconsistent naming that hurt maintainability. Extracting constants, removing inline styles, and standardizing naming would improve readability without adding complexity.
