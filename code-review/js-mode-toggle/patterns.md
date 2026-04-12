# Patterns Review — Mode Toggle
Lines: 1531–1545 | File: public/mtg-commander.html

## Findings

### Magic strings `'play'` and `'prepare'` repeated across call sites
**Severity:** Low
**Lines:** 1533, 780, 781
The mode values `'play'` and `'prepare'` are plain string literals used in both the HTML `onclick` attributes (lines 780–781) and inside `setMode()` (line 1533). If a mode name were ever changed, all occurrences would need to be updated manually. There are no constants defined for these values.
**Action:** Consider defining `const MODE = { PREPARE: 'prepare', PLAY: 'play' }` constants at the top of the script block, and reference them inside `setMode()` to make the valid values self-documenting and typo-safe.

### `toggleSidebar` is misleadingly named (pattern inconsistency)
**Severity:** Low
**Lines:** 1543–1545
Other toggle functions in the codebase use `toggle` semantics (e.g. `classList.toggle()`). `toggleSidebar` breaks this pattern by only ever removing the class, not alternating between states. This is a naming-convention inconsistency.
**Action:** Rename to `showSidebar()` or implement actual toggle behaviour with `classList.toggle('sidebar-collapsed')` and remove the now-redundant CSS-based visibility trick if a true toggle is implemented.

### Inline `style.display` mixed with class-based toggling
**Severity:** Low
**Lines:** 1536–1537
Lines 1536–1537 use `element.style.display = isPlay ? 'none' : ''` (inline style mutation) while lines 1534–1535 and 1538–1539 use `classList.toggle()`. Mixing these two approaches for visibility makes it harder to reason about which mechanism controls a given element's visibility. It also means those elements cannot have their display overridden by a CSS class if needed.
**Action:** Add a utility CSS class (e.g. `.hidden { display: none !important; }`) and use `classList.toggle('hidden', isPlay)` for all elements, making all visibility changes class-based and consistent.

## Summary
The segment is small and mostly coherent, but has three minor pattern issues: magic mode strings without constants, a misleadingly-named function, and an inconsistency between inline-style and class-based visibility toggling. None are blocking, but together they reduce maintainability and readability.
