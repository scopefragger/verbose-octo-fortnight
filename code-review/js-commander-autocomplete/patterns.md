# Patterns Review — Commander Autocomplete
Lines: 2056–2139 | File: public/mtg-commander.html

## Findings

### Magic number `8` used twice without a named constant
**Severity:** Low
**Lines:** 2104, 2108
The limit of 8 suggestions appears in two places. If it ever needs changing, both must be updated in sync.
**Action:** Extract `const AC_MAX_RESULTS = 8;` at the top of the autocomplete section and reference it in both `.slice()` calls.

### Magic number `200` (debounce delay) is unexplained
**Severity:** Low
**Lines:** 2071
The 200 ms debounce delay is a bare number with no comment or named constant.
**Action:** Define `const AC_DEBOUNCE_MS = 200;` alongside `acState` to make the intent clear and the value easy to tune.

### Inline `onclick` attribute string generation breaks the pattern used elsewhere
**Severity:** Medium
**Lines:** 2118
The rest of the file assigns event listeners via `addEventListener`. Using inline `onclick` in a template string is inconsistent with that pattern and forces data to be serialised as JS string literals (introducing the XSS risk noted in the security review).
**Action:** Build the dropdown items as DOM nodes (or assign a delegated listener on `dropdown`) and use `data-*` attributes to carry the name/IDs, consistent with how other dynamic list items in the file handle interaction.

### `catch` block silently swallows the error
**Severity:** Low
**Lines:** 2125
`catch { hideDropdown(dropdown, state); }` discards the error entirely with no logging. During development and in production this makes fetch failures invisible.
**Action:** Add `console.warn('Autocomplete fetch failed:', e)` (or route through the app's `logError` utility) inside the catch block before hiding the dropdown.

### ArrowDown/ArrowUp active-class update loops over all items every keystroke
**Severity:** Low
**Lines:** 2080, 2084
`items.forEach((el, i) => el.classList.toggle('active', i === state.index))` re-evaluates every item on every keystroke. For 8 items this is trivial, but the more idiomatic approach is to remove `.active` from the previously active item and add it to the new one.
**Action:** Track the previously active item reference, remove `.active` from it, and add `.active` to the new item. This is a minor optimisation and consistency improvement.

### `img alt=""` is empty — acceptable but could be descriptive
**Severity:** Low
**Lines:** 2119
The card preview image has `alt=""` (decorative intent). However, for users who cannot load images, a descriptive alt (e.g. the card name) would improve accessibility.
**Action:** Use `alt="${escapeHtml(name)}"` on the image so screen readers and broken-image states convey the card name.

## Summary
The section's main pattern issues are the magic literals, the inconsistent use of inline `onclick` versus `addEventListener`, and the silent error swallowing. Addressing these would make the code more consistent with the rest of the file and easier to maintain.
