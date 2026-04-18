# Architecture Review — js-graveyard-viewer
Lines: 2040–2054 | File: public/mtg-commander.html

## Findings

### Card-image-or-text rendering pattern is duplicated across sections
**Severity:** Low
**Lines:** 2046–2050
The pattern of rendering a card as either an `<img>` (if image available) or a fallback `<div>` with the card name appears in at least three places in the file: `bfCardHTML`, `renderPlayHand`, and here. Each location duplicates the optional-chaining logic for `image_uris?.normal || card_faces?.[0]?.image_uris?.normal` and the img/text branch.
**Action:** Extract to a shared helper `cardImageHTML(card, altClass)` used by all three sites. This was identified in the render-play-area review as well.

## Summary
Single-concern function with no significant architecture issues beyond the file-wide card-image-rendering duplication noted elsewhere.
