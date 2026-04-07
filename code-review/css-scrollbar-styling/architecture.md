# Architecture Review — Scrollbar Styling
Lines: 536–540 | File: public/mtg-commander.html

## Findings

### Global scrollbar override in a single-file application
**Severity:** Low
**Lines:** 537–540
The `::-webkit-scrollbar` rules use the universal pseudo-element selector, meaning they apply to every scrollable element in the page — not just panels where a custom scrollbar is intentional. In the current single-file structure this is deliberate and consistent, but if components are ever extracted into separate stylesheets or shadow-DOM elements the implicit coupling becomes invisible.
**Action:** Add a brief comment (e.g., `/* global — applies to all scrollable containers */`) to make the intentional scope explicit. If the project is ever modularised, scope the rules to a layout root selector such as `body` or `.layout` to contain the intent.

## Summary
The scrollbar block is architecturally appropriate for a monolithic single-file app. The only mild concern is that the universal selector silently couples the visual treatment to every future scrollable element; a one-line comment is sufficient mitigation at the current scale.
