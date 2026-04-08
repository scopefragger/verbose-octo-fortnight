# Architecture Review — Graveyard Viewer Modal
Lines: 1001–1010 | File: public/mtg-commander.html

## Findings

### Inconsistent close-button pattern across modals
**Severity:** Medium
**Lines:** 1002, 1004
This modal uses inline DOM manipulation in onclick handlers (`document.getElementById('grave-viewer').classList.add('hidden')`), while other modals like `card-modal` (line 1013) and `token-modal` (line 968) delegate to functions (`closeModal()` and `closeTokenModal()`).

**Action:** Extract a `closeGraveViewer()` function to match the pattern:
```js
function closeGraveViewer() {
  document.getElementById('grave-viewer').classList.add('hidden');
}
```
Then update onclick handlers to call this function. This improves testability and reduces duplication.

### Separation of concerns — modal state management
**Severity:** Low
**Lines:** 1006, 1007
The modal populates `grave-viewer-title` and `grave-viewer-cards` dynamically via JavaScript (`showGraveViewer()`, lines 2043–2053). This is correct—the HTML structure is a template, and content is injected at runtime. No architectural issue here.

**Action:** None required. The pattern is sound.

### Tight coupling to specific element IDs
**Severity:** Low
**Lines:** 1002, 1004, 1006, 1007
The inline onclick handlers and the layout depend on specific element IDs (`grave-viewer`, `grave-viewer-title`, `grave-viewer-cards`). If these IDs change, multiple places in the JS must also change.

**Action:** Consider documenting these element IDs in a constants object (e.g., `MODAL_IDS = { graveViewer: 'grave-viewer', graveViewerTitle: 'grave-viewer-title', ... }`) to centralize ID management, though this may be over-engineering for a single-page tool.

## Summary
The modal's architecture is sound and follows the established template pattern. Minor consistency issue: closing logic should be extracted into a dedicated function like `closeGraveViewer()` to match other modals in the file.
