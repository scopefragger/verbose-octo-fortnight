# Architecture Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Context menu state (`ctxTarget`) couples the menu to the battlefield card ID format
**Severity:** Low
**Lines:** 1999, 2011–2015
`ctxTarget` stores a battlefield card ID that is then passed to action functions (`tapCard`, `returnToHand`, etc.). The context menu is tightly coupled to the battlefield card data model: it can only act on battlefield cards, not hand cards or other zones. This is correct for current use but limits extensibility.
**Action:** No immediate change required. If the context menu is extended to support hand cards or other zones, `ctxTarget` should store a `{zone, id}` object and `ctxAction` should dispatch accordingly.

### Global `document.addEventListener` registered at module scope
**Severity:** Low
**Lines:** 2019–2021
The click dismiss handler is registered directly in module scope (not inside an init function or DOMContentLoaded handler). Since the script runs after DOM parse in a `<script>` tag at the bottom of the page, this is functionally equivalent to `DOMContentLoaded`. However, mixing function declarations with top-level side effects (event listener registration) makes the initialization sequence harder to trace.
**Action:** Move top-level event listener registrations to the `init()` function (if one exists in the file) to centralize initialization logic.

### `ctxAction` is the single entry point for all context menu actions — good design
**Severity:** Info
**Lines:** 2008–2017
Having a single dispatch function for all context menu actions is a clean pattern that makes the HTML `onclick` attributes minimal and keeps action logic in JS. This is good architecture for the current scope.
**Action:** No change required.

## Summary
The context menu implementation is simple and well-scoped. The main architectural point is that top-level event listener registration should move to an `init()` function for cleaner initialization flow. The tight coupling to battlefield card IDs is acceptable for the current feature scope.
