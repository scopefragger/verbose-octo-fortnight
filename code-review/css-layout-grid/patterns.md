# Code & Pattern Review — Layout Grid
Lines: 67–78 | File: public/mtg-commander.html

## Findings

### Magic number `57px` with no comment
**Severity:** Low
**Lines:** 72
The value `57px` in `calc(100vh - 57px)` is unexplained inline. A reader has no immediate way to know it represents the header bar height without inspecting the header CSS separately.
**Action:** Either replace with a CSS custom property (`var(--header-height)`) or add an inline comment: `/* 57px = header bar height */`.

### `gap: 0` is redundant
**Severity:** Low
**Lines:** 73
`gap: 0` is the default value for a grid container. Explicitly setting it adds noise without communicating intent. If the intent is to override a higher-specificity or inherited rule, that should be commented.
**Action:** Remove `gap: 0` unless it is genuinely overriding something, in which case add a comment explaining why.

### No comment explaining the collapse technique
**Severity:** Low
**Lines:** 74, 76–78
Animating `grid-template-columns` to collapse a sidebar is a non-obvious pattern. There is no comment explaining why this approach was chosen over alternatives (e.g., `width: 0`, `transform: translateX`, `display: none`). Future maintainers may not realize the transition on line 74 and the override on line 77 are intentionally paired.
**Action:** Add a short comment above `.layout.sidebar-collapsed` noting that the transition on `.layout` drives the collapse animation.

## Summary
The segment is clean and idiomatic. The main pattern-level concerns are the unexplained magic number, a redundant `gap: 0`, and the absence of comments tying the collapse transition to its companion rule. All are low severity and cosmetic in nature.
