# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` (the action) lives far from `showTokenModal` (the UI)
**Severity:** Low
**Lines:** 1843–1847 (addToken), 2023–2038 (showTokenModal)
`addToken()` is defined at line 1843 as part of the play state section, while `showTokenModal()` at line 2023 generates buttons that call it. The separation is reasonable given the single-file structure but means the complete token creation flow spans ~200 lines.
**Action:** No structural change needed for a single-file app; a comment in `showTokenModal` linking to `addToken` would aid navigation.

### Token modal close logic is split between two functions
**Severity:** Low
**Lines:** 1846 (addToken closes modal), 2034–2038 (closeTokenModal)
The modal is closed in two different places: `addToken()` closes it after adding a token, and `closeTokenModal()` handles the click-outside case. This is logical but means the close behaviour is not centralised.
**Action:** Both call paths are straightforward; no change strictly required. A comment noting both close paths would help future maintainers.

### `showTokenModal` has a side effect of rebuilding innerHTML on every call
**Severity:** Low
**Lines:** 2025–2030
The token preset buttons are re-generated from the static `COMMON_TOKENS` array every time the modal is opened. Since the data never changes, this is unnecessary work.
**Action:** Render the presets once (on first open or during init) and skip re-rendering on subsequent opens.

## Summary
The Token Modal section is small and focused. The main architectural concern is the regeneration of static HTML on every modal open. The split close logic and cross-section function references are minor and acceptable in a single-file app context.
