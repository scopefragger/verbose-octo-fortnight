# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` is defined outside the reviewed segment but called from it
**Severity:** Low
**Lines:** 2029
`addToken()` is defined at line 1843, well outside the Token Modal section (2023–2038). The segment description lists `addToken()` as belonging here, but the actual definition lives in a different block. This makes the section boundary misleading and can cause confusion during maintenance.
**Action:** Either move `addToken()` to line ~2039 so it is co-located with the modal it serves, or update the section description in SEGMENTS.MD and any comments to reflect that `addToken()` is defined in the Play Core section.

### Unused `i` parameter in `.map()` callback
**Severity:** Low
**Lines:** 2026
`COMMON_TOKENS.map((t, i) => { ... })` — the index `i` is declared but never used in the callback body.
**Action:** Remove the unused `i` parameter: change to `.map(t => { ... })`.

### `t.name` rendered unescaped into button text content
**Severity:** Low
**Lines:** 2029
`${t.name}` is interpolated directly into the innerHTML string for the button's text content. Currently `COMMON_TOKENS` is a hard-coded constant so this is safe, but if tokens ever come from an external or user-supplied source the button label would be unescaped.
**Action:** Wrap with `escapeHtml(t.name)` to future-proof the template: `>${escapeHtml(t.name)}${fly}</button>`.

### `closeTokenModal` closes only on overlay click — no keyboard/Escape dismissal
**Severity:** Low
**Lines:** 2034–2038
The modal can only be closed by clicking the overlay background. There is no `keydown` listener for the Escape key or a dedicated close button inside the modal.
**Action:** Add an `Escape` key handler (e.g., in a document-level `keydown` listener) that calls `document.getElementById('token-modal').classList.add('hidden')` when the modal is visible.

## Summary
The Token Modal section is small and largely correct. The main static concern is the unused `i` index parameter in the map callback and the fact that `addToken()` — listed in this section's description — is actually defined 180 lines earlier. The unescaped `t.name` in button text is currently harmless but is a latent risk if token data sources ever change.
