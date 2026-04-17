# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken()` is defined far from the Token Modal section (line 1843 vs 2023)
**Severity:** Low
**Lines:** 1843–1847, 2023
`addToken()` is the primary mutation function for the token modal — it adds a token to the battlefield and closes the modal. However, it is defined ~180 lines before the Token Modal section, interleaved with game-action functions (`discardFromHand`, `putOnTop`). Its placement implies it belongs to the game-action layer rather than the modal UI layer, but it also directly manipulates the modal's CSS class (line 1846: `document.getElementById('token-modal').classList.add('hidden')`).
**Action:** Either move `addToken()` adjacent to the Token Modal section, or separate the mutation (`pushToBattlefield`) from the modal-close side effect. The modal could call `closeTokenModal()` after `addToken()` returns, keeping `addToken` free of UI concerns.

### `showTokenModal()` regenerates preset buttons on every open
**Severity:** Low
**Lines:** 2024–2031
The preset button list is rebuilt from scratch every time the modal opens, even though `COMMON_TOKENS` is a static constant that never changes at runtime. This is a minor inefficiency but also means any future dynamic token lists would already have the right pattern — however, for static data it is unnecessary work.
**Action:** Build the preset HTML once (e.g. in a `DOMContentLoaded` handler or when the script first runs) and cache it, only updating `token-presets.innerHTML` if the data is dynamic.

### `closeTokenModal()` is a guard-wrapped event handler, not a general close function
**Severity:** Low
**Lines:** 2034–2038
`closeTokenModal(e)` requires a click event argument and only closes if `e.target` is the overlay. This means it cannot be called programmatically (without a synthetic event) as a general "close modal" utility. In contrast, `addToken()` calls `classList.add('hidden')` directly on the element rather than through `closeTokenModal()`.
**Action:** Extract the close logic into a parameter-less `hideTokenModal()` helper. Have `closeTokenModal(e)` call it conditionally, and have `addToken()` also call it.

### Token modal has no focus management for accessibility
**Severity:** Low
**Lines:** 2023–2038
When `showTokenModal()` opens the modal, focus is not moved into the modal. This breaks keyboard navigation — users tabbing from a button that triggered the modal will remain focused outside the modal overlay.
**Action:** After removing the `hidden` class, call `tokenModalEl.querySelector('button, input')?.focus()` to move focus into the modal.

## Summary
The main architectural concern is `addToken()` straddling two responsibilities: game-state mutation and modal UI management. Separating these would make both functions easier to test and reason about. The modal also lacks programmatic close and focus management, which are standard modal architecture requirements.
