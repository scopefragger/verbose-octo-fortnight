# Security Review — Play State
Lines: 1547–1641 | File: public/mtg-commander.html

## Findings

### `renderManaPool()` injects API-sourced color symbols into innerHTML without escaping
**Severity:** Medium
**Lines:** 1630
The `c` values iterated in `MANA_COLORS.filter(c => manaPool[c] > 0).map(c => ...)` come from the `MANA_COLORS` constant defined in the same file (`['W','U','B','R','G','C']`), so in normal flow they are safe. However, if `manaPool` is ever extended with keys sourced from external data (e.g. `produced_mana` from Scryfall via `getLandMana`), those keys would be interpolated into innerHTML without escaping.
**Action:** Ensure `renderManaPool` only ever iterates `MANA_COLORS` (the constant), never dynamic keys from `manaPool` itself. Add a comment making this constraint explicit.

### `getLandMana()` propagates unvalidated Scryfall data into mana pool keys
**Severity:** Low
**Lines:** 1565–1568
`card.produced_mana` is populated directly from a Scryfall API response. While these values are written as object keys (not injected into HTML here), they flow into `manaPool` through the caller at line 1726, and subsequently into `renderManaPool`'s innerHTML. If Scryfall ever returned a crafted symbol containing HTML characters, it could cause XSS.
**Action:** Whitelist `produced_mana` values against `MANA_COLORS` before using them as keys.

## Summary
The main XSS risk is indirect — Scryfall-sourced mana symbols that bypass the `MANA_COLORS` whitelist could propagate into innerHTML in `renderManaPool`. Whitelisting at the `getLandMana` ingestion point would close this path entirely.
