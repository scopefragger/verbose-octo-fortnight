# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `addToken` function referenced in `onclick` but not visible in this section
**Severity:** Low
**Lines:** 2029
`onclick="addToken(${escapeHtml(JSON.stringify(t))})"` references `addToken`, which is defined in the play-core section (not shown in these lines). This cross-section dependency is unavoidable in a single-file app but should be documented.
**Action:** Add a comment noting that `addToken` is defined in the play-core section.

### `closeTokenModal` only closes when clicking the modal backdrop, not a close button
**Severity:** Low
**Lines:** 2034–2038
`closeTokenModal(e)` checks `e.target === document.getElementById('token-modal')`. This means the modal only closes when clicking the backdrop directly — there is no explicit close button in this section. If the modal's internal content fills the viewport, users may be unable to close it.
**Action:** Ensure the modal HTML includes a visible close button with an `onclick="document.getElementById('token-modal').classList.add('hidden')"` handler.

## Summary
The token modal section is very small (16 lines). The primary concern is the `escapeHtml(JSON.stringify(t))` pattern used to embed token data in `onclick` (see Security review). The `closeTokenModal` backdrop-only close pattern may trap users if the modal fills the screen.
