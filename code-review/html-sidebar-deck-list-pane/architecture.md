# Architecture Review — Sidebar Deck List Pane
Lines: 832–838 | File: public/mtg-commander.html

## Findings

### Save Deck button duplicated across two panes
**Severity:** Low
**Lines:** 827 (Import pane), 834 (Deck List pane)
"Save Deck" functionality is surfaced via two separate `<button>` elements in two different sibling panes — one in the Import pane (line 827, `id="save-btn"`) and one here (line 834). Both call `saveDeck()`. While this is a deliberate UX choice to keep Save reachable from both views, the duplication means any future changes to the button's visual state (e.g., disabling it when nothing has changed, showing a spinner) must be applied to both elements in sync. The two buttons have different CSS classes (`btn-gold btn-sm` vs `btn-gold`), so they are not fully identical twins, raising the risk of visual inconsistency.
**Action:** Consider whether one canonical Save button with toggled visibility would serve both panes, or document the intentional duplication with a comment so future maintainers update both sites together.

### Rendered card list responsibility split between HTML structure and JS renderer
**Severity:** Low
**Lines:** 832–838
The outer container (`<div id="pane-cards">`) owns the Save/Edit button bar as static HTML, while `<div id="deck-list-content">` is fully owned by `renderDeckList()`. This means the pane has a split identity: part of it is static layout and part is a JS-managed render target. If `renderDeckList()` ever needs to conditionally replace the button bar (e.g., read-only mode for a shared deck), it cannot do so without reaching outside its container. The coupling is implicit and undocumented.
**Action:** Either make the entire pane contents JS-rendered (for full control) or explicitly document the boundary between static chrome and dynamic content with HTML comments.

## Summary
Both findings are low-severity maintainability concerns rather than functional bugs. The duplicated Save button is the more actionable item — if interactive state (loading, disabled) is ever added to Save, forgetting to update the second instance will cause a visible UI inconsistency. The split static/dynamic responsibility in the pane is a minor architectural seam worth documenting.
