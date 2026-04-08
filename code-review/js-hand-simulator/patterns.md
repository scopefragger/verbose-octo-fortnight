# Patterns Review — Hand Simulator
Lines: 1325–1432 | File: public/mtg-commander.html

## Findings

### Magic number `7` for default hand size and `7 - mulliganCount` formula
**Severity:** Low
**Lines:** 1343, 1359, 1367
The MTG starting hand size `7` appears multiple times inline. If the hand size were configurable or tested at a different value, it would need to be changed in multiple places.
**Action:** Extract `const STARTING_HAND_SIZE = 7`.

### `style.display` used throughout instead of `hidden` class
**Severity:** Low
**Lines:** 1349–1352, 1363, 1372, 1373, 1385
`style.display = ''`, `style.display = 'none'`, `style.display = 'block'` are used consistently in this section but inconsistently with the rest of the file which uses the `hidden` CSS class.
**Action:** Standardise on `classList.toggle('hidden', ...)` throughout the file.

### `keepHand` appends `' ✓'` to textContent with string concatenation
**Severity:** Low
**Lines:** 1374
`document.getElementById('mulligan-info').textContent += ' ✓'` mutates the current text by appending. If `keepHand` is called multiple times, `' ✓ ✓ ✓'` would accumulate.
**Action:** Set to a fixed value: `document.getElementById('mulligan-info').textContent = 'Keeping hand ✓'` or derive from `hand.length`.

### Emoji in button text as UI state
**Severity:** Low
**Lines:** 1384, 1413
`btn.textContent = '⏳ Thinking…'` and `'🧠 Critique'` use emojis as loading state indicators in button text. Emojis are not accessible (screen readers may read them verbatim). A spinner element (like the loading spinner CSS class already defined) would be more accessible.
**Action:** Use a `<span class="loading-spinner">` for the loading state and `aria-label` for the resting state, consistent with the import button pattern.

## Summary
Hand simulator patterns are mostly consistent with the rest of the file. Key improvements: extract `STARTING_HAND_SIZE = 7`, standardise `hidden` class visibility, fix `keepHand` accumulating `' ✓'` on repeat calls, and replace emoji loading states with accessible spinner elements.
