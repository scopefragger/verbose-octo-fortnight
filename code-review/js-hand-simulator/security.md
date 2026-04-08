# Security Review — Hand Simulator
Lines: 1325–1432 | File: public/mtg-commander.html

## Findings

### `escapeQuotes` and `escapeHtml` correctly applied in `renderHand`
**Severity:** Informational
**Lines:** 1424, 1426, 1427, 1429
`escapeQuotes(card.name)` in onclick and `escapeHtml(card.name)` in display context are correctly applied. The `img src` uses `imgUrl` from `card.image_uris?.normal` — a Scryfall URL that is injected into a `src` attribute. Scryfall URLs should be HTTPS and well-formed, but this is a trust assumption.
**Action:** Consider validating that `imgUrl` starts with `https://` before injecting it into `src`.

### `hand.map(c => ({ name, mana_cost, type_line }))` sends Scryfall data to own API
**Severity:** Low
**Lines:** 1399
Card fields `name`, `mana_cost`, `type_line` are sent in the POST body to `/api/mtg/critique-hand`. These come from Scryfall and are not user-modified. The server should validate input length and format.
**Action:** Ensure the server-side critique endpoint validates/sanitises input (check `index.js`).

### `critiqueHand` silent `catch {}` — no logging
**Severity:** Low
**Lines:** 1408–1410
The catch block displays a user message but discards the error object. Debugging failures is harder without the error in the console.
**Action:** Change to `catch (err) { console.error('critique failed', err); textEl.textContent = '...' }`.

### `res.ok` not checked before calling `res.json()` in `critiqueHand`
**Severity:** Medium
**Lines:** 1406
`const json = await res.json()` is called without checking `res.ok`. If the API returns a 401 or 500, `res.json()` may succeed but `json.critique` will be undefined, leading to `'No response.'` — masking the actual error.
**Action:** Add `if (!res.ok) throw new Error(res.statusText)` before `res.json()`.

## Summary
`renderHand` correctly uses `escapeQuotes`/`escapeHtml`. One medium finding: `res.ok` not checked in `critiqueHand` masking API errors. Two low findings: Scryfall image URL not validated before `src` injection, error object discarded in catch.
