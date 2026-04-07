# Static Code Review — Sidebar Toggle Button
Lines: 95–115 | File: public/mtg-commander.html

## Findings

### `display: none` with `align-items`/`justify-content` has no effect until `display: flex`
**Severity:** Low
**Lines:** 106–108
The rule sets `display: none` on `.sidebar-toggle`, then declares `align-items: center` and `justify-content: center` in the same block. Those flex properties are silently ignored while the element is hidden. The flex properties only take effect when `.sidebar-collapsed .sidebar-toggle` overrides `display` to `flex` (line 115). This is harmless but misleading — a reader must notice the override rule to understand why the flex properties are present.
**Action:** Move `align-items` and `justify-content` into the `.sidebar-collapsed .sidebar-toggle` rule alongside `display: flex`, or add a comment explaining the intentional pattern.

### No ARIA attributes on the toggle button
**Severity:** Low
**Lines:** 95–115 (CSS), HTML line 899
The button rendered with this class (`<button class="sidebar-toggle" onclick="toggleSidebar()">`) carries no `aria-label` or `aria-expanded` attribute. Screen readers will announce the raw `▶` character as the accessible name, which is unhelpful. The `title="Show deck panel"` attribute helps sighted users on hover but is not reliably surfaced by all screen readers.
**Action:** Add `aria-label="Show deck panel"` to the HTML element. Optionally, `aria-expanded` could be toggled by `toggleSidebar()` to convey collapsed/expanded state.

## Summary
The CSS itself is structurally sound. The main static issue is that flex layout properties are declared under `display: none`, making them invisible until the override rule applies — this is functional but confusing to read. Accessibility attributes on the companion HTML element are missing.
