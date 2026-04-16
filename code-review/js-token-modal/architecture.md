# Architecture Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` is called from both modal preset buttons and `addCustomToken`, but is defined in a separate section
**Severity:** Low
**Lines:** 2029, 1843, 1849–1856
`addToken` at line 1843 serves as the single entry point for adding any token (preset or custom) to the battlefield. However, it directly closes the token modal (`classList.add('hidden')`) as a side effect. This means `addToken` has knowledge of the UI modal's visibility state — a responsibility that arguably belongs to the modal section, not the token-addition logic.
**Action:** Remove the `classList.add('hidden')` call from `addToken` and instead call `closeTokenModal()` (or a direct hide call) from the `showTokenModal` preset handlers after `addToken` returns. This keeps `addToken` as a pure data-mutation function.

### `showTokenModal` mixes data rendering with modal visibility
**Severity:** Low
**Lines:** 2024–2032
`showTokenModal` both populates the preset buttons (a render concern) and removes the `hidden` class (a visibility concern). These are distinct responsibilities that are easy to separate.
**Action:** Extract `renderTokenPresets()` for the DOM population logic, and keep `showTokenModal` focused on visibility. This makes it easy to refresh presets independently of opening the modal.

### Token preset rendering regenerates all button HTML on every open
**Severity:** Low
**Lines:** 2026–2030
`presets.innerHTML` is fully replaced every time `showTokenModal` is called, even though `COMMON_TOKENS` is a static constant that never changes. This is wasteful DOM work on each open.
**Action:** Render the presets once at page initialisation (e.g. in an `initTokenModal()` call) and cache the result, rather than rebuilding on every open.

### Modal close is split between `closeTokenModal` (click-outside) and `addToken` (after selection)
**Severity:** Low
**Lines:** 1846, 2034–2037
The token modal can be hidden in two different ways — by clicking outside it (`closeTokenModal`) or by selecting a token (`addToken`). Neither path calls a shared `hideTokenModal()` helper, so any future logic needed on close (e.g. clearing custom token inputs) would need to be duplicated in both places.
**Action:** Introduce a `hideTokenModal()` helper and call it from both `addToken` and `closeTokenModal`. This ensures close-time logic is always consistent.

## Summary
The token modal section is small but has responsibility leakage in two directions: `addToken` knows about the modal UI, and `showTokenModal` re-renders static data on every open. Extracting a `hideTokenModal()` helper and rendering presets once at init would cleanly separate concerns and eliminate the unnecessary re-render cost.
