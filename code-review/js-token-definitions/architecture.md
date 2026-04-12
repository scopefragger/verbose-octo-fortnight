# Architecture Review — Token Definitions
Lines: 1647–1662 | File: public/mtg-commander.html

## Findings

### Data constant defined far from its only consumer
**Severity:** Low
**Lines:** 1647–1662 (definition), 2026 (only consumer)
`COMMON_TOKENS` is defined at line 1647 but its sole consumer, `showTokenModal()`, is at line 2026 — nearly 380 lines away. In a single-file app this is a minor concern, but a comment (e.g. `// used by showTokenModal()`) or co-locating the constant near that function would improve navigability.
**Action:** Either move `COMMON_TOKENS` to be adjacent to `showTokenModal()` (lines ~2023) or add a cross-reference comment at the definition site.

### Token shape is not enforced by any schema or constructor
**Severity:** Low
**Lines:** 1647–1662
All token objects are plain object literals with no enforced shape. `addToken()` (line 1843) accepts `tokenData` directly and pushes it onto the battlefield array, trusting that the required fields exist. The custom token path (line 1855) constructs a partial object with `type_line: 'Token Creature'` (no colour list structure consistency), which diverges from the richer preset objects.
**Action:** Define a factory function `makeToken({ name, power, toughness, type_line, colors, keywords })` with defaults that both the preset array and `addCustomToken()` use, ensuring consistent shape.

### No separation between "preset catalogue" and "runtime token instance"
**Severity:** Low
**Lines:** 1647–1662, 1843–1844
`COMMON_TOKENS` entries are used directly as `card` values on battlefield objects. A token definition (catalogue entry) and a placed token instance (with `id`, `tapped`, `zone`) are conceptually different but share the same shape. Changes to how battlefield card objects are structured would require updating the catalogue too.
**Action:** When constructing a battlefield instance in `addToken()`, explicitly map catalogue fields to the instance shape rather than spreading the raw catalogue object.

## Summary
The constant is appropriately scoped as a module-level declaration in a single-file app. The main architectural gaps are the distance between definition and consumer, the absence of a shared factory for token construction, and the blurring of "catalogue entry" vs "game instance" concepts.
