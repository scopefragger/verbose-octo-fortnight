# Security Review — Card Context Menu
Lines: 966–979 | File: public/mtg-commander.html

## Findings

### No input sanitization or escaping in addCustomToken()
**Severity:** High  
**Lines:** 974, 1849–1855
User-supplied input from `custom-token-name`, `custom-token-power`, and `custom-token-tough` is passed directly to `addToken()` without sanitization. The token data is then used in `renderPlayArea()` and subsequently rendered in the DOM via innerHTML. If token names contain HTML/script tags, they could execute.  
**Action:** Implement HTML escaping when rendering token data. The project already has an `esc()` function per CLAUDE.md guidelines. Wrap token name, power, and toughness values with `esc()` before any DOM insertion.

### No XSS protection on dynamically populated token-presets
**Severity:** High  
**Lines:** 971
The `token-presets` div is populated via JavaScript at line 2025 using `.innerHTML` without visible sanitization. If preset token data comes from user input or external sources, it could contain XSS vectors.  
**Action:** Confirm that token preset data is hardcoded and trusted. If dynamically loaded, sanitize all user-provided fields before insertion. Use `textContent` instead of `innerHTML` where possible.

### Overlay click handler may not properly prevent event propagation
**Severity:** Low  
**Lines:** 968, 2034–2037
The modal overlay uses `onclick="closeTokenModal(event)"` to close when clicking the overlay itself. The handler checks `if (e.target === document.getElementById('token-modal'))` to prevent closing when clicking the inner box. This pattern works but relies on event.target comparison. A child element (like the button at line 987) could accidentally close the modal if event propagation is incorrect.  
**Action:** Verify that inner elements have `onclick="event.stopPropagation()"` or use a more robust delegation pattern. The structure at line 969 wraps all content in `token-modal-box`, which should prevent clicks from reaching the overlay directly, but no explicit stopPropagation is visible.

## Summary
XSS vulnerability exists in token rendering: user input is not escaped before DOM insertion. Preset data handling requires verification that sources are trusted. Modal event handling is functional but lacks explicit event propagation guards.
