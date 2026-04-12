# Static Code Review — Render Play Area
Lines: 1858–1923 | File: public/mtg-commander.html

## Findings

### `play-hand-count` updated twice per `renderPlayArea()` call
**Severity:** Low
**Lines:** 1867, 1907
`renderPlayArea()` sets `play-hand-count` at line 1867, then `renderPlayHand()` (called at line 1861) also sets it at line 1907. The second write is redundant. The element ends up correct, but the duplicate write is noise and could mask future bugs if the two sources ever diverge.
**Action:** Remove the `play-hand-count` assignment from `renderPlayHand()` (line 1907) since `renderPlayArea()` already owns all counter updates, or conversely remove it from `renderPlayArea()` and let `renderPlayHand()` own it exclusively.

### `bfc.card.toughness` unguarded when `power` check passes
**Severity:** Medium
**Lines:** 1898
The guard `bfc.card.power != null` protects the interpolation block, but `bfc.card.toughness` inside that block has no corresponding null check. If a card object has `power` set but `toughness` is missing or `undefined` (e.g. a malformed token from the token definitions), the rendered output will display `2/undefined`.
**Action:** Change the guard to `bfc.card.power != null && bfc.card.toughness != null`, or use nullish coalescing: `` `${bfc.card.power ?? '?'}/${bfc.card.toughness ?? '?'}` ``.

### `shortName` can be the full name when the card has no comma
**Severity:** Low
**Lines:** 1886
`bfc.card.name?.split(',')[0]` returns the whole name when there is no comma, so the fallback `|| bfc.card.name` is dead code — `split` never returns an empty string for a non-empty input.
**Action:** Remove the `|| bfc.card.name` fallback, or document the intent with a comment. If the goal is to shorten long multi-part names, the current logic is already correct; the dead fallback is just misleading.

### `typeof selectedBFId !== 'undefined'` guard is unnecessary
**Severity:** Low
**Lines:** 1887
`selectedBFId` is declared with `let` at module scope (line 1556) and initialized to `null`. The `typeof` guard was defensive coding that is no longer needed and adds confusion about whether the variable might actually be undeclared.
**Action:** Simplify to `selectedBFId === bfc.id`.

### `img` URL injected into `src` without sanitisation
**Severity:** Low
**Lines:** 1890, 1918
`img` is taken directly from the Scryfall API response (`bfc.card.image_uris?.small`) and interpolated into `src` without any escaping. In practice Scryfall URIs are safe, but there is no defensive guard against a `javascript:` URI being present in a crafted card object stored in the database.
**Action:** See Security review for fuller discussion; at minimum document the trusted-source assumption.

## Summary
The section is mostly correct. The most actionable bugs are the unguarded `toughness` field (can produce `N/undefined` in rendered HTML) and the redundant `play-hand-count` double-write. The dead `typeof` guard and dead fallback are low-priority cleanup items.
