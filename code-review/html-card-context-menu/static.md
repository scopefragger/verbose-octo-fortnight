# Static Code Review — Card Context Menu
Lines: 966–979 | File: public/mtg-commander.html

## Findings

### Undefined function reference: closeTokenModal()
**Severity:** Medium  
**Lines:** 968
The `closeTokenModal(event)` function is referenced in the `onclick` handler but this function is defined at line 2034 in the JavaScript section. While the function does exist, it's not immediately visible in the HTML segment and relies on the script section being loaded properly.  
**Action:** This is acceptable for inline event handlers in a single-file architecture. No action needed, but consider documenting that all `onclick` handlers require corresponding JS definitions.

### Undefined function reference: addCustomToken()
**Severity:** Low  
**Lines:** 987
The `addCustomToken()` function is called in the button's `onclick` handler (line 987, just outside the specified range but relevant). This function is defined at line 1849 and should be verified to exist.  
**Action:** Confirm all `onclick` handlers have corresponding function definitions in the script section.

### Missing placeholder validation in input elements
**Severity:** Low  
**Lines:** 974, 976–977
Three input fields use `placeholder` attributes but have no `required` attribute or client-side validation. The `addCustomToken()` function at line 1849 does validate the name field, but Power and Toughness are optional with falsy defaults. This is intentional, not a bug.  
**Action:** No change needed—the code correctly handles optional fields.

## Summary
The HTML structure correctly references JavaScript functions defined later in the file. All referenced functions exist and are properly implemented. No undefined variables or logic errors detected in this segment.
