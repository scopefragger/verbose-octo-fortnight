# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### Unused loop variable `i` in `COMMON_TOKENS.map`
**Severity:** Low
**Lines:** 2026
`COMMON_TOKENS.map((t, i) => { ... })` declares `i` but never uses it inside the callback. This is dead code.
**Action:** Remove `i` from the destructured parameters: `COMMON_TOKENS.map(t => { ... })`.

### `presets` could be null — no null guard after `getElementById`
**Severity:** Low
**Lines:** 2025–2026
`document.getElementById('token-presets')` is used without a null check. If the element is absent, `.innerHTML = ...` will throw a TypeError.
**Action:** Add `if (!presets) return;` immediately after the `getElementById` call.

### `closeTokenModal` only closes on exact backdrop click — logic may surprise users
**Severity:** Low
**Lines:** 2034–2037
`e.target === document.getElementById('token-modal')` means the modal only closes when the outermost element is clicked. If the modal's inner wrapper catches the click before it bubbles to the modal root, this condition is never true and the modal cannot be dismissed. Depending on CSS layout, this may be broken already.
**Action:** Test the click-outside behaviour. If the inner content div stops event propagation, restructure with a dedicated backdrop overlay element that reliably receives the click.

### `closeTokenModal` queries the DOM on every call
**Severity:** Low
**Lines:** 2035–2036
`document.getElementById('token-modal')` is called twice in the same function (once for the `===` comparison and once to add `'hidden'`). The element reference is not cached.
**Action:** Cache the element: `const modal = document.getElementById('token-modal'); if (e.target === modal) modal.classList.add('hidden');`.

### `addToken` is defined far from its primary call site
**Severity:** Low
**Lines:** 2029 (call), 1843 (definition)
`addToken` is defined at line 1843 but called from `showTokenModal` at line 2029. This is not a bug (function declarations/expressions hoist or are in scope), but the proximity gap makes the segment harder to review in isolation.
**Action:** Add a comment at line 2029: `// addToken() defined at line 1843 — Play Tokens section`.

## Summary
The section is brief and mostly correct. The unused `i` parameter and missing null guards are minor issues. The click-outside close logic in `closeTokenModal` is fragile and warrants testing against the actual DOM structure.
