# Architecture Review — Panel Header & Deck Tabs
Lines: 117–143 | File: public/mtg-commander.html

## Findings

### Active-state logic split between CSS and JavaScript
**Severity:** Low
**Lines:** 142–143
The visual active state of a tab is driven by the `.active` class, which implies JavaScript elsewhere is responsible for adding/removing that class at runtime (see `switchTab()` in JS section, lines 1057–1069). The tab styling contract — "add `.active` to mark a tab selected" — is implicit and undocumented. If a developer adds a new tab pane, they must know to call `switchTab()` rather than toggling a class manually, and the CSS gives no indication of this.
**Action:** Add a short comment above `.deck-tab.active` noting that this class is managed by `switchTab()` in the JS section, so the coupling is visible to anyone reading the CSS in isolation.

### Background opacity duplication between `.panel-header` and `.deck-tabs`
**Severity:** Low
**Lines:** 120, 129
Both `.panel-header` and `.deck-tabs` independently set a semi-transparent black background (`rgba(0,0,0,0.2)` and `rgba(0,0,0,0.15)` respectively). These values are not shared via a CSS variable, so adjusting the overall panel background tint requires two separate edits. In a single-file app this is a minor maintainability cost, but it will drift if one value changes without the other.
**Action:** Extract these into named CSS variables (e.g. `--panel-bg-strong` / `--panel-bg-subtle`) defined alongside the other design tokens.

## Summary
The segment is architecturally straightforward. The two findings are both low severity: the implicit JavaScript/CSS coupling for `.active` state management, and duplicated magic background-opacity values that should be shared design tokens.
