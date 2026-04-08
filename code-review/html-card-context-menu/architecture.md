# Architecture Review — Card Context Menu
Lines: 966–979 | File: public/mtg-commander.html

## Findings

### Modal state management mixed between HTML visibility and JavaScript
**Severity:** Medium  
**Lines:** 968, 1846, 2031, 2035–2036
The modal's open/closed state is controlled through DOM class manipulation (`hidden` class toggle) rather than a centralized state object. Both `addCustomToken()` and `closeTokenModal()` directly manipulate the DOM. This works but makes state implicit and harder to track.  
**Action:** Consider creating a `tokenModalState` or similar object that tracks modal open/closed state. Current approach is acceptable for a single-file tool but becomes harder to maintain if modal interactions expand.

### Separation of concerns: input gathering mixed with business logic
**Severity:** Medium  
**Lines:** 974–977, 1849–1855
The HTML inputs are gathered and validated within the `addCustomToken()` function. If multiple flows need to add tokens (e.g., drag-and-drop, context menu), logic duplication will occur.  
**Action:** Extract a `getCustomTokenData()` function that returns validated token data, separate from the act of adding it to the battlefield. This allows input gathering to be reused.

### Modal remains accessible without validation flow
**Severity:** Low  
**Lines:** 968–987
The modal can be opened and has three separate action paths: preset buttons (line 971), and custom inputs (lines 974–987). However, there's no overall validation flow—invalid inputs silently fail in `addCustomToken()` (line 1851). Users won't know why nothing happened.  
**Action:** Add toast notifications or validation messages when custom token creation fails (e.g., missing name, invalid power/toughness).

## Summary
Modal state management relies on DOM class manipulation rather than explicit state tracking. Input validation is mixed into the add function rather than separated. Both approaches work for current scope but reduce reusability and create tight coupling to the modal HTML structure.
