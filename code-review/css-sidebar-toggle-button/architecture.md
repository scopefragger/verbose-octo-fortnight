# Architecture Review — Sidebar Toggle Button
Lines: 95–115 | File: public/mtg-commander.html

## Findings

### Toggle button is placed inside the play area, not the sidebar
**Severity:** Medium
**Lines:** 95–115 (CSS), HTML line 898–899
The `.sidebar-toggle` button is rendered as a child of `#play-area` (the content panel) rather than the `.deck-panel` (the sidebar itself) or the `.layout` grid wrapper. Because it is `position: absolute` relative to `#play-area`, it visually appears at the left edge of the content area when the sidebar collapses — which works today but couples the button's position to the content panel's layout context. If `#play-area` ever loses `position: relative`, or its padding/border changes, the button will shift unexpectedly. A more robust placement would be as a direct child of `.layout` or `.deck-panel`, positioned relative to the grid boundary.
**Action:** Consider moving the toggle button to be a sibling of `.deck-panel` inside `.layout`, positioned relative to the layout wrapper. This decouples it from the play area's internal layout concerns.

### `toggleSidebar()` only removes the collapsed class; there is no re-collapse path
**Severity:** Low
**Lines:** 1543–1545 (JS)
`toggleSidebar()` is a one-way operation: it only removes `sidebar-collapsed`. The `setMode()` function (line 1539) re-adds it when switching to play mode, but there is no way for the user to re-collapse the sidebar once they have expanded it mid-game. The button and function name imply a toggle, but the implementation is a one-shot restore. This is a behavioural inconsistency surfaced by the CSS: `.sidebar-toggle` is styled as though it will appear and disappear repeatedly, yet once shown and clicked it is never shown again in the same session unless the user switches modes.
**Action:** Either rename the function to `showSidebar()` to reflect its actual behaviour, or implement true toggle logic (add back `sidebar-collapsed` if not currently collapsed, remove it if collapsed).

## Summary
The sidebar toggle button works correctly for its current use case, but its DOM placement inside the play area creates an implicit positional dependency on `#play-area` having `position: relative`. Additionally, `toggleSidebar()` is misnamed — it is a one-way restore, not a true toggle — which will confuse future maintainers.
