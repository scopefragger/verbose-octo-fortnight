# Static Review — Token Modal
Lines: 2023–2038 | File: public/mtg-commander.html

## Findings

### `pt` variable computed but never used
**Severity:** Medium
**Lines:** 2027
`const pt = t.power != null ? ` ${t.power}/${t.toughness}` : '';` is computed on every iteration but is never referenced in the returned button string at line 2029. The power/toughness display was presumably intended to appear in the button label but is missing from the template literal.
**Action:** Either include `pt` in the button label (e.g. `${t.name}${pt}${fly}`) to show the stat line, or remove the variable if the power/toughness display is intentionally omitted.

### `closeTokenModal()` calls `getElementById` on every invocation without caching or null guard
**Severity:** Low
**Lines:** 2035–2036
`document.getElementById('token-modal')` is called twice inside `closeTokenModal` — once in the `if` condition and once in the body. Neither call is null-guarded. The same element is also looked up in `showTokenModal` (line 2031) and in `addToken` (line 1846) — four separate lookups across three functions.
**Action:** Cache the element reference at module level (e.g. `const tokenModalEl = document.getElementById('token-modal');`) and use it throughout. Add a null guard at cache time.

### `showTokenModal()` does not guard against missing `token-presets` element
**Severity:** Low
**Lines:** 2025
`document.getElementById('token-presets')` is not null-checked. If the element is absent, the immediately following `.innerHTML` assignment will throw a `TypeError`.
**Action:** Add `if (!presets) return;` after the `getElementById` call.

### `closeTokenModal` only closes on backdrop click — no keyboard dismiss
**Severity:** Low
**Lines:** 2034–2038
The modal closes only when `e.target` is the overlay element itself (a backdrop click). There is no `Escape` key handler. The `token-modal-box` inner content click will not trigger a close (correct), but users who expect `Escape` to dismiss modals will find the modal stuck open.
**Action:** Add a `keydown` listener for `Escape` that calls `closeTokenModal` or directly adds the `.hidden` class, consistent with accessibility best practices.

## Summary
The most concrete static bug is the unused `pt` variable — power/toughness is computed but silently dropped from the button label, meaning token buttons show only the name and flying indicator. The repeated uncached `getElementById` lookups are a minor inefficiency, and the missing `Escape` key handler is an accessibility gap.
