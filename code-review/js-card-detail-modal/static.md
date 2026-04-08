# Static Review — Card Detail Modal
Lines: 1434–1452 | File: public/mtg-commander.html

## Findings

### `closeModal` only closes on exact backdrop click — no keyboard dismiss
**Severity:** Low
**Lines:** 1448–1452
`closeModal` checks `e.target === modal` to close only on backdrop click. There is no keyboard handler (Escape key) to dismiss the modal. Users relying on keyboard navigation cannot close this modal.
**Action:** Add a `keydown` listener for `Escape` that calls `closeModal` (or directly removes `hidden`), or wire the existing close button to a direct `classList.add('hidden')` call.

### No null guard on `document.getElementById` calls
**Severity:** Low
**Lines:** 1440–1445
All six `getElementById` calls assume elements exist. If the modal HTML is ever changed, these will throw TypeErrors silently.
**Action:** No immediate change needed; optional chaining (`?.`) on assignments would provide graceful degradation.

### `modal-img` src set to empty string when no image
**Severity:** Low
**Lines:** 1440
`imgUrl` defaults to `''` when no `image_uris` are available. Setting `img.src = ''` causes the browser to fire a request to the current page URL, which is a wasted network request.
**Action:** Add a guard: `if (imgUrl) modal.src = imgUrl; else modal.src = '/placeholder.png';` or hide the image element when no URL is available.

## Summary
`showCardDetail` and `closeModal` are clean and correct. Key findings: no keyboard dismiss (Escape key), wasted network request when card has no image, and no null guards on element lookups.
