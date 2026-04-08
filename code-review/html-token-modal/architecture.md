# Architecture Review — Token Modal
Lines: 982–999 | File: public/mtg-commander.html

## Findings

### Modal Closing Logic Tied to Overlay Click
**Severity:** Low
**Lines:** 968, 2034–2038

The modal closes only when the user clicks the overlay div itself (not content inside). The `closeTokenModal()` function checks `if (e.target === document.getElementById('token-modal'))`, which is fragile because:
1. It doesn't close if the user clicks the close button (none exists)
2. Clicking the modal-box content doesn't close it (good for UX, but no explicit close button as backup)

**Action:** Add an explicit close button or ensure the modal has an intuitive close mechanism. Current behavior is acceptable for an overlay modal, but lacks a visible escape path.

### Mixing Form Inputs and Button in Modal
**Severity:** Low
**Lines:** 973–987

The token creation form structure mixes preset buttons (line 971, populated via `openTokenModal()`) with custom token inputs. The preset buttons are rendered dynamically via JavaScript, while the custom inputs are static HTML. This split responsibility makes the modal harder to extend.

**Action:** Consider consolidating the modal structure or documenting the separation of concerns: presets (JavaScript-generated) vs. custom inputs (HTML static). This is minor but affects maintainability.

### State Management for Token Modal
**Severity:** Low
**Lines:** 968, 1846, 2031

The modal visibility is managed via the `hidden` class on `#token-modal`. This works but couples the modal state to the DOM. There's no centralized state object tracking modal open/close.

**Action:** While the current approach is acceptable for a single-file HTML app, document this pattern or consider adding a state object if more modals are added. Current implementation is consistent with the codebase style.

### Missing Reset on Modal Close
**Severity:** Low
**Lines:** 2034–2038

When `closeTokenModal()` is called, the input fields (`#custom-token-name`, `#custom-token-power`, `#custom-token-tough`) are not cleared. Users who close and reopen the modal will see stale values.

**Action:** Clear input fields in `closeTokenModal()`:
```js
function closeTokenModal(e) {
  if (e.target === document.getElementById('token-modal')) {
    document.getElementById('token-modal').classList.add('hidden');
    document.getElementById('custom-token-name').value = '';
    document.getElementById('custom-token-power').value = '';
    document.getElementById('custom-token-tough').value = '';
    document.getElementById('custom-token-color').value = 'G';
  }
}
```

## Summary

The modal architecture is sound for a single-page app but has minor UX gaps (no explicit close button, stale form state on reopen). The split between JavaScript-rendered presets and static custom inputs is acceptable but could be better documented.
