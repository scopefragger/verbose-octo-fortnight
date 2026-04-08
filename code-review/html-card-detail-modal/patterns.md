# Patterns Review — Card Detail Modal
Lines: 1013–1026 | File: public/mtg-commander.html

## Findings

### Inconsistent modal close pattern: `closeModal()` vs. inline classList manipulation
**Severity:** Medium
**Lines:** 1013–1015 vs. 1002–1004
The card modal's overlay uses `onclick="closeModal(event)"` (delegating to a named function) while its own close button uses a direct inline `document.getElementById('card-modal').classList.add('hidden')`. The graveyard viewer (lines 1002–1004) uses inline manipulation consistently for both overlay and button. None of the three modals (card, graveyard, token) follow the same pattern, creating three distinct variants of identical close behaviour.
**Action:** Adopt one pattern across all modals. The named-function approach (`closeModal` / `dismissModal`) is preferable because it is easier to extend and test. Refactor the close button (line 1015) to call the same function used by the overlay, and apply the same pattern to the graveyard and token modals.

### `position: relative` duplicated as inline style across two modals
**Severity:** Low
**Lines:** 1003, 1014
Both the graveyard viewer modal (line 1003) and the card detail modal (line 1014) carry `style="position:relative"` as an inline attribute. The `.modal` CSS class does not declare this property, so it was added as a workaround. This is a pattern of CSS rules escaping the stylesheet.
**Action:** Add `position: relative;` to the `.modal` CSS rule (line 451) and remove the inline `style` attributes from both elements.

### Toast `#toast` ID is a bare global singleton — no scoping or encapsulation
**Severity:** Low
**Lines:** 1029, 2149–2155
The `#toast` element and its associated `toastTimer` variable (line 2149) are bare globals with no encapsulation. This is consistent with the rest of the file's vanilla JS style, so it is not an inconsistency per se. However, a call to `showToast()` while another toast is mid-animation silently resets the timer without clearing the visual state transition.
**Action:** Low priority. If toast queuing or stacking is ever needed, wrap in a lightweight module pattern. For now, document that only one toast can show at a time.

### Magic string `'hidden'` class repeated across many inline handlers
**Severity:** Low
**Lines:** 1002, 1004, 1013, 1015
The string `'hidden'` appears in at least 10 inline `onclick` handlers across the HTML. While there is no CSS variable equivalent for class names, a named JS constant (`const HIDDEN = 'hidden'`) or a consistent helper would reduce the chance of a typo silently breaking dismiss behaviour.
**Action:** Low priority. If the class name ever changes (e.g., to `d-none` for a CSS framework migration), a global search-and-replace would be needed. Consider documenting the convention or extracting a `hide(id)` / `show(id)` utility pair.

## Summary
The card detail modal HTML is clean and minimal. The dominant pattern concern is the inconsistency in how modals are dismissed: the same close behaviour is implemented three different ways across the file's three modals. Unifying dismiss logic and promoting the repeated `position:relative` inline style to the CSS class are the two highest-value changes.
