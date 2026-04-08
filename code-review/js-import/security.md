# Security Review — Import
Lines: 1147–1194 | File: public/mtg-commander.html

## Findings

### `btn.innerHTML` used to inject loading spinner HTML
**Severity:** Low
**Lines:** 1154
`btn.innerHTML = '<span class="loading-spinner"></span> Loading…'` uses `innerHTML` for static HTML with no user data — this is safe as-is. However, using `innerHTML` as a pattern normalises it; future developers may copy this pattern with user data.
**Action:** Consider using `btn.textContent = ''` plus `btn.appendChild(spinner)` to avoid `innerHTML` entirely, or add a comment noting this is static content only.

### `deck-name` value displayed in toast without escaping
**Severity:** Medium
**Lines:** 1150, 1167
`name` comes from `document.getElementById('deck-name').value` (user input) and is interpolated into a `showToast` message: `` `Deck "${name}" loaded!` ``. If `showToast` sets `innerHTML` rather than `textContent`, this is an XSS vector.
**Action:** Check how `showToast` renders its argument. If it uses `innerHTML`, switch to `textContent` in `showToast` or escape `name` before interpolation.

## Summary
One medium-severity XSS risk: user-entered deck name interpolated into toast message — safety depends on `showToast`'s internals. The `innerHTML` usage for the spinner is safe but sets a bad pattern.
