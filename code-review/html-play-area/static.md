# Static Code Review — Play Area
Lines: 898–963 | File: public/mtg-commander.html

## Findings

### Missing null/undefined guard for classList access
**Severity:** Medium
**Lines:** 923
The onclick handler checks `event.target.classList.contains('bf-zone')` without first verifying that `event.target` has a classList property. While this is unlikely to fail in modern browsers, element nodes created dynamically (or certain special nodes) could theoretically lack classList.

**Action:** Add a safety check: `event.target?.classList?.contains('bf-zone')` or guard with `event.target && event.target.classList && event.target.classList.contains(...)`.

### String conversion in onclick attribute at line 923
**Severity:** Low
**Lines:** 923
The complex conditional logic in the onclick attribute is difficult to read and maintain. While not incorrect, it violates the principle of keeping JavaScript logic out of HTML attributes.

**Action:** Extract the logic into a named function like `function closeIfBackgroundClicked(e)` for clarity and testability.

### Undefined element ID references
**Severity:** Low
**Lines:** 910, 912, 920
IDs like `mana-pool-display`, `mana-pool-pips`, and `library-count` are referenced in the HTML but their initial values are not set. They rely on JavaScript to populate them (which happens in `renderPlayArea()` and other functions).

**Action:** No action required if `startGame()` or similar initialization always runs before user interaction. Document this dependency in a comment near line 898.

## Summary
The section is functionally sound with no critical static issues. The main concern is the complex conditional in the onclick handler (line 923), which should be extracted to a helper function for maintainability.
