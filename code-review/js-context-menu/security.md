# Security Review — Context Menu
Lines: 1996–2021 | File: public/mtg-commander.html

## Findings

### `ctxTarget` (card ID) flows into action functions without validation
**Severity:** Low
**Lines:** 2011–2015
`ctxTarget` is set from the `id` argument of `showCtxMenu(e, id)` and later passed directly to `tapCard`, `returnToHand`, `putOnTop`, `sendToGrave`, and `sendToExile`. If a caller ever passes a non-ID value (e.g. injected through a malicious deck payload), those downstream functions receive an untrusted value. The risk is currently low because `ctxTarget` is only set from onclick attributes on rendered battlefield cards, but the chain is not validated.
**Action:** Validate that `ctxTarget` matches the expected format (e.g. a UUID or a numeric ID) before dispatching actions. A simple `typeof ctxTarget === 'string' && ctxTarget.length > 0` check at the top of `ctxAction` would make the contract explicit.

### Menu position derived from `clientX`/`clientY` — no injection risk
**Severity:** Low
**Lines:** 2002–2005
`e.clientX` and `e.clientY` are used only for CSS `left`/`top` pixel values. These are numeric and cannot carry XSS payloads.
**Action:** No action required.

### No innerHTML usage in this section — XSS risk is absent
**Severity:** Low
**Lines:** 1996–2021
The context menu content is entirely static HTML defined in the page markup. No user or API data is interpolated into innerHTML here.
**Action:** No action required; this is a positive pattern.

## Summary
The context menu section has a minimal attack surface. The only concern is the unvalidated `ctxTarget` value flowing into action functions, which is low-risk given current call sites but worth a type/format guard for defensive depth.
