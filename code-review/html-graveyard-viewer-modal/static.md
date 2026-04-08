# Static Code Review — Graveyard Viewer Modal
Lines: 1001–1010 | File: public/mtg-commander.html

## Findings

### Undefined function reference in onclick attribute
**Severity:** Low
**Lines:** 1002, 1004
The `onclick` handlers directly manipulate the DOM via `document.getElementById()` without checking if the element exists. While this is safe in this context (the element is on the same page), the code does not follow the pattern used elsewhere in the codebase for similar modals.

**Action:** Consistency improvement—consider creating a dedicated close function like `closeGraveViewer()` (following the pattern of `closeModal()` and `closeTokenModal()`) rather than inlining DOM manipulation in onclick attributes.

### Potential dead code path
**Severity:** Low
**Lines:** 1002
The onclick handler on the overlay (`onclick="document.getElementById('grave-viewer').classList.add('hidden')"`) can be reached via event bubbling, but line 1003 uses `onclick="event.stopPropagation()"` to prevent it. This is correct, but the pattern differs from other modals in the file (e.g., `card-modal` and `token-modal` use dedicated close functions).

**Action:** Consider whether the inline onclick is necessary or if a dedicated function would improve consistency and maintainability.

## Summary
No critical static issues detected. The code correctly references elements that exist in the DOM and uses valid event handling. However, the closing pattern differs from other modals in the file, which could be unified for consistency.
