# Architecture Review — Layout Grid
Lines: 67–78 | File: public/mtg-commander.html

## Findings

### Sidebar collapse mechanism relies on animating `grid-template-columns` to zero
**Severity:** Low
**Lines:** 70, 74, 76–78
Collapsing the sidebar by setting its grid track to `0` leaves the sidebar's DOM content technically visible at zero width (it overflows unless `overflow: hidden` is set on the sidebar child). The collapse behavior is split between this layout rule and whatever the `.sidebar-collapsed` toggle in JavaScript does. If the sidebar element lacks `overflow: hidden`, content will bleed out during and after the transition. This is a subtle contract between two separate rules that is not made explicit.
**Action:** Confirm that the `.deck-panel` (or equivalent sidebar element) carries `overflow: hidden`. If not, add it there. Consider a comment in the layout rule noting the dependency.

## Summary
The two-column grid approach to sidebar collapse is a reasonable pattern, but it creates an implicit dependency on the sidebar child having `overflow: hidden`. That contract is invisible from this segment alone and could cause rendering defects if the sidebar styles are changed independently.
