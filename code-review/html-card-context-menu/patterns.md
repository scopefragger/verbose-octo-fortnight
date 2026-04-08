# Code & Pattern Review — Card Context Menu
Lines: 966–979 | File: public/mtg-commander.html

## Findings

### Inline styles duplicate CSS variable pattern inconsistently
**Severity:** Medium  
**Lines:** 972, 976–978
Line 972 uses inline `style="..."` with hardcoded values and CSS variables mixed: `font-size:0.75rem;color:var(--text-dim)`. Lines 976–978 repeat this pattern for input boxes. While the project has comprehensive CSS classes (`.token-custom`, `.token-custom-row`), some visual adjustments are inlined instead of delegated to CSS.  
**Action:** Move inline styles to CSS classes. For example, create `.token-custom-label` for the divider at line 972, and `.token-input-sm` for the power/toughness fields instead of `style="max-width:80px"`.

### Inconsistent modal structure compared to other modals in file
**Severity:** Low  
**Lines:** 968–989
This modal uses `onclick="closeTokenModal(event)"` and custom ID-based event handling. Other modals in the file (line 1002, 1013) follow a similar pattern but with slight variations. The card-modal (line 1013) uses `onclick="closeModal(event)"` while this uses `closeTokenModal()`. The pattern is consistent but the function names differ.  
**Action:** Standardize modal handler naming to a single convention: `closeModal(e)` for all overlays, with an optional parameter to specify which modal to close.

### Missing CSS class: token-modal-select style bleeding into inline styles
**Severity:** Low  
**Lines:** 978
The `<select>` element at line 978 has a full inline style definition: `style="flex:1;background:var(--card);border:1px solid var(--card-border);border-radius:8px;padding:7px 10px;color:var(--text);font-size:0.85rem"`. The CSS file has `.token-custom-row` but no corresponding `.token-custom-select` or similar class.  
**Action:** Create a `.token-custom-select` CSS class in the style block (line 757+) and apply it to the select element instead of inline styles.

### Magic string: placeholder text with embedded example
**Severity:** Low  
**Lines:** 974
The placeholder "Token name (e.g. 1/1 Soldier)" is a magic string that provides inline help. If this text needs to change for UX reasons (e.g., "e.g. 2/2 Knight"), it must be updated in this file with no centralized reference.  
**Action:** Create a `PLACEHOLDER_TEXTS` or `UI_STRINGS` object at the top of the script section to centralize UI strings, or document this placeholder in a comment.

### Hardcoded color options without centralized constant
**Severity:** Low  
**Lines:** 978–984
The Magic color options (`W`, `U`, `B`, `R`, `G`, `C`) are hardcoded in the select element. If a new format or color variant is added, this must be updated here and in any other token-related code (e.g., rendering).  
**Action:** Create a `MAGIC_COLORS` constant at the top of the script section and populate the select via JavaScript in `showTokenModal()` for maintainability.

## Summary
Inline styles repeat CSS variable patterns that could be consolidated into classes. Modal handler naming is inconsistent with other modals in the file. UI strings and color constants are hardcoded instead of centralized, making future updates error-prone. The patterns work but reduce maintainability.
