# Architecture Review — js-token-modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Preset buttons re-rendered on every modal open
**Severity:** Low
**Lines:** 2025–2030
`showTokenModal()` rebuilds the entire preset button list (`presets.innerHTML = ...`) every time the modal opens. Since `COMMON_TOKENS` is a static constant that never changes at runtime, the preset HTML is identical on every call. This is wasted rendering work.
**Action:** Render the presets once during `DOMContentLoaded` (or lazily on first open with a flag). Subsequent `showTokenModal()` calls only need to show the modal.

## Summary
Single-function section with one low-severity issue: the preset list is unnecessarily rebuilt on every modal open. Given the static nature of `COMMON_TOKENS`, this is a minor efficiency issue with a straightforward fix.
