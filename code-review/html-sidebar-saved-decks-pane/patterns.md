# Code & Pattern Review — Sidebar — Saved Decks Pane
Lines: 841–843 | File: public/mtg-commander.html

## Findings

### Inline placeholder text
**Severity:** Low
**Lines:** 842
The loading state uses inline text "Loading…" as a placeholder. While appropriate for UX, this differs slightly from other panes: `pane-import` has no placeholder, `pane-cards` uses "No deck loaded yet." Consider defining a consistent empty/loading state convention.
**Action:** Optional — the current approach is fine. If standardizing, document the convention in CLAUDE.md.

### Hidden class styling pattern
**Severity:** Low
**Lines:** 841
The pane uses `class="saved-area hidden"` where the `hidden` class sets `display: none` (line 263). This matches the pattern used in `pane-import` (line 796) and `pane-cards` (line 832), as well as other modals throughout the file. Consistent with codebase patterns.
**Action:** No action required — follows established convention.

### Nested container structure
**Severity:** Low
**Lines:** 841–843
The pattern of outer container (`saved-area`) + inner content container (`saved-decks-list`) mirrors the structure of other sections. The outer handles visibility/layout, the inner handles content. This is consistent with the `deck-list-view` → `deck-list-content` pattern seen at lines 832–837.
**Action:** No action required — consistent pattern.

### Dynamic content injection approach
**Severity:** Medium
**Lines:** 842 (related to line 1478, 1483, 1495)
Content is injected via `innerHTML` using template literals with proper escaping. However, multiple code paths set different HTML snippets (loading spinner, empty state, populated list). The loading state at line 1478 uses `<span class="loading-spinner"></span>` which assumes this CSS class exists. Verify the class definition.
**Action:** Verify that `.loading-spinner` CSS class is defined. If not defined, the loading spinner will not display visually.

### Missing constant for API endpoint
**Severity:** Low
**Lines:** 842 (related to line 1480)
The endpoint `/api/mtg/decks` is hardcoded in `loadSavedDecks()` at line 1480. Other similar API calls (lines 1502, 1522) also use hardcoded paths. Consider defining API endpoints as constants at the top of the script section for maintainability.
**Action:** Optional refactor — extract API paths to constants if the codebase is expected to grow. Current approach is acceptable for a tool of this size.

## Summary
The pane follows established patterns consistently across the file (tab switching, visibility toggling, content injection). Minor recommendations include verifying the `loading-spinner` CSS class exists and optionally standardizing API endpoint definitions. Overall code quality and pattern adherence is strong.
