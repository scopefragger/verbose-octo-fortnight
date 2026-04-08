# Static Code Review — Card Detail Modal
Lines: 1013–1026 | File: public/mtg-commander.html

## Findings

### Empty `alt` attribute on modal image
**Severity:** Low
**Lines:** 1017
The `<img class="modal-img" id="modal-img" src="" alt="" />` has a permanently empty `alt` attribute. The `src` starts empty but is populated by `showCardDetail()` with a card image URL. The `alt` is never updated to reflect the card name being displayed, leaving the image without meaningful alternative text.
**Action:** In `showCardDetail()` (line 1440), set `document.getElementById('modal-img').alt = card.name;` alongside the `src` assignment so the `alt` reflects the actual card.

### Close button duplicates the JS logic instead of calling `closeModal()`
**Severity:** Low
**Lines:** 1015
The `<button class="modal-close">` uses an inline `onclick` that directly manipulates `classList` (`document.getElementById('card-modal').classList.add('hidden')`), bypassing the `closeModal()` function defined at line 1448. This is inconsistent — the overlay's `onclick` delegates to `closeModal()` while the button does not.
**Action:** Change the button's handler to call `closeModal({target: document.getElementById('card-modal')})` or, better, add a dedicated `closeCardModal()` helper and use it from both the button and the overlay.

### Inline `style="position:relative"` on `.modal` div
**Severity:** Low
**Lines:** 1014
The inner `.modal` div carries `style="position:relative"` as an inline style. All other `.modal` styling is in the `<style>` block. Identical inline style also appears on the graveyard viewer's modal (line 1003), meaning the rule should simply be promoted to the `.modal` CSS class.
**Action:** Add `position: relative;` to the `.modal` CSS rule at line 451, and remove the inline `style` attribute from both modal elements (lines 1003 and 1014).

## Summary
The HTML structure is correct and the element IDs are properly referenced by the JS layer. The main static issues are a permanently empty `alt` attribute, a close-button handler that bypasses the declared `closeModal()` function, and a repeated inline style that should be lifted into the CSS class. None are blocking bugs, but the inconsistencies make the code harder to maintain.
