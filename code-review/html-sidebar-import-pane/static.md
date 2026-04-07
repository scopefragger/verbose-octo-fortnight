# Static Review — Sidebar Import Pane
Lines: 796–829 | File: public/mtg-commander.html

## Findings

### Missing `type` attribute on buttons
**Severity:** Low
**Lines:** 823, 826, 827
The three `<button>` elements (`Load Deck`, `Clear`, `Save`) have no explicit `type` attribute. Inside any ancestor that could ever be wrapped in a `<form>`, omitting `type` defaults to `type="submit"`, which would cause unintended page navigation or form submission. Even without a `<form>` ancestor today, the omission is a latent trap should the markup be reorganised.
**Action:** Add `type="button"` to all three buttons.

### `id="import-btn-text"` span is never referenced in this segment
**Severity:** Low
**Lines:** 824
The `<span id="import-btn-text">` is presumably mutated by `importDecklist()` (e.g., to show "Loading…"). That coupling is invisible at the call site: the button's `onclick` invokes `importDecklist()` but nothing here signals why the inner span needs its own id. If `importDecklist()` is ever renamed or refactored, the id becomes dead markup with no static trace.
**Action:** Add a brief comment — e.g., `<!-- text toggled by importDecklist() -->` — or document the coupling in the JS function.

### No `maxlength` on deck-name input
**Severity:** Low
**Lines:** 798
`#deck-name` has no `maxlength`. If the value is passed to an API (which it is — `saveDeck()` POSTs it), an arbitrarily long string reaches the server with no client-side guard. The database column likely has a limit; surfacing that limit here improves UX and reduces wasted round-trips.
**Action:** Add `maxlength` matching the DB column constraint (or a reasonable upper bound such as 100).

### Commander/partner inputs lack `maxlength`
**Severity:** Low
**Lines:** 802, 806
Same issue as above — these values are also persisted. Scryfall card names are bounded (~140 chars at most), but there is no client-side enforcement.
**Action:** Add `maxlength="200"` (or tighter) to both commander inputs.

## Summary
The segment is clean and well-structured. The four findings are all low-severity defensive hygiene issues: missing `type="button"` on buttons, an undocumented id coupling, and absent `maxlength` guards on inputs that feed into API calls. None are currently breaking, but each is a small latent hazard worth closing.
