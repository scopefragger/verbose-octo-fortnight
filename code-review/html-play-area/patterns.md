# Code & Pattern Review — Play Area
Lines: 898–963 | File: public/mtg-commander.html

## Findings

### Inconsistent inline style approach
**Severity:** Medium
**Lines:** 898, 907, 910–913, 917–919, 938–939, 959
The section mixes inline styles (position:relative, display:flex, gap:4px, font-size:0.72rem) with CSS class-based styling. Some styles are in inline attributes, others belong in a .play-controls class rule.

**Examples:**
- Line 907: `style="font-size:0.72rem;color:var(--text-dim);margin-left:2px"` — duplicates .sep and other play-controls child styling
- Line 910: `style="display:flex;align-items:center;gap:4px;font-size:0.78rem;min-width:60px"` — should be a class
- Line 938–939: Flexbox layout inline, should use CSS

**Action:** Extract common inline styles into CSS classes: `.mana-pool-display`, `.focus-header-flex`, `.hand-label-text`. Keep only dynamic/state-based styles inline.

### Inconsistent alt text pattern
**Severity:** Low
**Lines:** 936
The focus-img has `alt=""` (empty), but in the hand rendering (line 1918), alt text is set dynamically to the card name. This inconsistency makes accessibility unpredictable.

**Action:** Set `id="focus-img"` alt text dynamically in JavaScript when loading a card (in both `selectBFCard()` and `selectHandCard()`).

### Magic numbers and hardcoded dimensions
**Severity:** Low
**Lines:** 898, 907, 910–912, 917–919, 938, 959
Multiple font sizes (0.72rem, 0.78rem, 0.65rem, 0.7rem) and gaps (4px, 8px) are hardcoded inline. These values should be CSS variables for consistency and maintainability.

**Action:** Define CSS variables: `--font-xs: 0.65rem;`, `--font-sm: 0.72rem;`, `--gap-xs: 4px;` and use them throughout.

### Onclick handler pattern inconsistency
**Severity:** Low
**Lines:** 899–919
Button onclick handlers use a variety of patterns:
- Simple function calls: `onclick="toggleSidebar()"`
- Inline conditionals: `onclick="if(event.target===this||...)closeFocusPanel()"`
- Color customization via inline style

**Action:** Standardize to always use simple function calls. Extracting the complex condition at line 923 into `closeIfBackgroundClicked(e)` aligns with this pattern.

### Semantic HTML concern
**Severity:** Low
**Lines:** 923
The `<div class="battlefield">` container uses onclick for event delegation. While functional, using a `<section>` or `<div role="main">` would be more semantic. The onclick behavior suggests keyboard interaction isn't fully supported.

**Action:** Consider adding keyboard support (`onkeydown`, `tabindex`) or use event delegation via JavaScript (addEventListener) rather than inline onclick.

### Missing comment documentation
**Severity:** Low
**Lines:** 898–963
The play-area section has no header comment explaining which JS functions populate its dynamic content. A reader must search the codebase to understand the render flow.

**Action:** Add a comment block at the top:
```html
<!--
PLAY AREA — dynamically rendered by:
- renderPlayArea() updates turn, life, library, hand, grave/exile counts
- renderBattlefield() updates .bf-perms and .bf-lands
- selectBFCard() / selectHandCard() populate #card-focus-panel
- Mana pool display: updateManaPoolDisplay()
-->
```

## Summary
The Play Area section prioritizes inline styles and inline event handlers, which works but violates consistency patterns seen elsewhere in the codebase. Extracting common styles to CSS classes and simplifying event handlers would improve maintainability.
