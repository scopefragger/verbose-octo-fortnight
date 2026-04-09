# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### Menu position calculated from `e.clientX`/`e.clientY` — no injection risk
**Severity:** Info
**Lines:** 2002–2005
Menu positioning uses `e.clientX` and `e.clientY` (native browser event integers) and `window.innerWidth`/`window.innerHeight`. These are all numeric browser-provided values with no injection surface.
**Action:** No action required.

### `ctxTarget` (card ID) is passed directly to action functions without validation
**Severity:** Low
**Lines:** 2011–2015
`ctxTarget` is set from `id` passed to `showCtxMenu`. If the calling code passes a non-UUID value, those action functions (`tapCard`, `returnToHand`, etc.) may behave unexpectedly. However, all callers in the battlefield render HTML pass `bfc.id` values (UUIDs), so the practical risk is low.
**Action:** Validate that `ctxTarget` is a non-empty string before dispatching actions.

## Summary
No significant security issues. The context menu handles numeric browser event data and ID values from controlled render code. No user-supplied text is interpolated into HTML within this section.
