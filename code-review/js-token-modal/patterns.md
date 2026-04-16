# Patterns Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Flying keyword detection uses a hardcoded string literal `'Flying'`
**Severity:** Low
**Lines:** 2028
`t.keywords?.includes('Flying')` hard-codes the keyword name as a bare string. If keyword names in `COMMON_TOKENS` ever change capitalisation or spelling, this silently stops working.
**Action:** Define a constant: `const KW_FLYING = 'Flying';` and use it in the check. Alternatively, if more keyword icons are added in future, a keyword-to-icon map object would be cleaner.

### Flying icon `' ✈'` is a magic string with embedded whitespace
**Severity:** Low
**Lines:** 2028
`const fly = t.keywords?.includes('Flying') ? ' ✈' : '';` uses an emoji with a leading space hard-coded in the value. This mixes layout spacing (the leading space) with content (the emoji).
**Action:** Render the icon separately in the template: `` `${escapeHtml(t.name)}${t.keywords?.includes('Flying') ? ' <span class="kw-icon">✈</span>' : ''}` `` and control spacing via CSS.

### Inconsistent modal close pattern: `classList.remove('hidden')` vs `style.display`
**Severity:** Low
**Lines:** 2031, 2036
The token modal uses `classList.remove/add('hidden')` for visibility, which is the correct pattern used elsewhere (focus panel uses `classList.add/remove('visible')`). However the two modals use opposite class conventions: `hidden` (present = invisible) vs `visible` (present = visible). This is a minor inconsistency worth standardising.
**Action:** Pick one convention across all modals — either `hidden` (hidden when class is present) or `visible` (visible when class is present) — and apply it consistently to all modal elements.

### `pt` variable computed but never used in the button label
**Severity:** Low
**Lines:** 2027, 2029
`const pt = t.power != null ? \` ${t.power}/${t.toughness}\` : '';` is computed but `pt` is never referenced in the button template at line 2029. This is dead code.
**Action:** Either use `pt` in the button label (e.g. append it to the name: `` `${t.name}${pt}${fly}` ``) or remove the variable if the power/toughness should not appear in the preset button.

### No visual distinction between tokens with different power/toughness in the preset buttons
**Severity:** Low
**Lines:** 2029
The button label only shows `t.name` and a flying icon. Two tokens with the same name but different stats (e.g. a 1/1 and a 2/2 Soldier) would appear identical in the UI.
**Action:** Include `pt` in the button label once the dead-code issue above is resolved: `` `${escapeHtml(t.name)}${pt}${fly}` ``.

## Summary
The section has two notable pattern issues: the `pt` variable is computed but never used (dead code), and the modal visibility convention (`hidden` class) is inconsistent with the focus panel's `visible` class convention. The Flying keyword detection and icon rendering also have minor hardcoding issues that would benefit from constants or a keyword map.
