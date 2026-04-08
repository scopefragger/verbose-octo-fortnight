# Security Review — Play Area
Lines: 898–963 | File: public/mtg-commander.html

## Findings

### String literals passed to onclick callbacks safe from injection
**Severity:** Low
**Lines:** 917–919
Inline onclick handlers pass hardcoded function names (`showTokenModal()`, `endTurn()`, etc.) without user input. However, the broader pattern in the file (seen in lines 1986–1990) does interpolate user-controlled `idx` and `idStr` values directly into onclick attributes. This is a systematic pattern issue rather than a specific problem in lines 898–963.

**Action:** Ensure all dynamic values interpolated into onclick handlers are wrapped with `escapeQuotes()` (which is done in `bfCardHTML()` at line 1889) or use event delegation and `data-*` attributes instead.

### Potential XSS through innerHTML in focus-actions
**Severity:** Low
**Lines:** 947 (card-focus-actions dynamically rendered at 1986–1990)
The `focus-actions` div is populated with innerHTML from user-controlled card data (card names, mana costs). While the code uses `escapeHtml()` for card names elsewhere, the dynamically generated buttons in lines 1986–1990 inject the mana cost directly without escaping: `` `▶ Play ${card.mana_cost || ''}`  ``.

**Action:** Verify that `card.mana_cost` (sourced from Scryfall API) is safe, or add `escapeHtml()` wrapper: `` `▶ Play ${escapeHtml(card.mana_cost || '')}` ``.

### alt attributes on images
**Severity:** Low
**Lines:** 936
The focus image element has an empty `alt=""` and relies on JavaScript to set the `src`. If the image load fails, there is no fallback text.

**Action:** Set a dynamic alt text via JavaScript when the image is loaded (already done correctly in hand rendering at line 1918 with `alt="${escapeHtml(card.name)}"`).

## Summary
No critical XSS vulnerabilities in the Play Area section itself. The escaping functions are properly used in the HTML. Minor concern: dynamic mana cost strings should be explicitly escaped in the focus panel buttons for consistency.
