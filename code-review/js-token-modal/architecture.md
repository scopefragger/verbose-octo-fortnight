# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` and `addCustomToken` are defined at lines 1843–1856, far from the Token Modal section
**Severity:** Low
**Lines:** 1843–1856, 2023–2038
The token modal's primary actions (`addToken`, `addCustomToken`) are defined ~180 lines earlier in the Render Play Area section rather than with the modal's own show/close functions. This scatters the token modal's logic across two distant parts of the file.
**Action:** Move `addToken` and `addCustomToken` to immediately follow `closeTokenModal` (after line 2038) for co-location of related functionality.

### `showTokenModal` regenerates preset button HTML on every open
**Severity:** Low
**Lines:** 2025–2030
`COMMON_TOKENS` is a static array that never changes at runtime. Regenerating the preset buttons HTML via `innerHTML = ...` on every modal open is unnecessary. This could be done once on page load and cached.
**Action:** Populate the preset buttons once during initialization (or lazily on first open) and skip regeneration on subsequent opens: add an `if (!presets.children.length)` guard.

### `closeTokenModal` is a backdrop-click handler misnamed as a close function
**Severity:** Low
**Lines:** 2034–2037
The function is attached as an `onclick` handler to the modal overlay element. Its name implies it always closes the modal, but it only closes on backdrop clicks. This is called from HTML as `onclick="closeTokenModal(event)"`.
**Action:** Rename to `onTokenModalBackdropClick(e)` to accurately reflect its conditional behavior. Add a separate `closeTokenModal()` function for programmatic closing.

## Summary
The main architectural issue is the separation of `addToken`/`addCustomToken` from the Token Modal section, which makes the modal's complete behavior hard to find in one place. The static preset button regeneration on every open is a minor performance inefficiency.
