# Static Code Review — Save / Load
Lines: 1454–1529 | File: public/mtg-commander.html

## Findings

### saveDeck always creates a new record — no update path
**Severity:** Medium
**Lines:** 1464–1467
`saveDeck()` always calls POST `/api/mtg/decks`. If a deck with the same name already exists, this silently creates a duplicate rather than updating it. There is no PUT branch when a deck was loaded from a saved record (i.e., when the user edits and re-saves).
**Action:** Track a `currentDeckId` variable; when set, call PUT `/api/mtg/decks/:id` instead of POST.

### `tokens: []` hardcoded — tokens placed during play are never persisted
**Severity:** Medium
**Lines:** 1466
The save payload always sends `tokens: []`. Tokens that the user added to the battlefield in play mode are lost on save. The schema column `tokens JSONB` exists for this purpose.
**Action:** Collect tokens from `playBattlefield` (cards with no Scryfall `id`, i.e., generated tokens) and include them in the save payload.

### `loadDeckFromSaved` silently swallows all errors
**Severity:** Low
**Lines:** 1514–1516
The catch block catches all exceptions (including ones from `importDecklist()`) and shows only a generic toast. If `saved.cards` is missing/malformed the user sees "Failed to load deck" with no diagnostic information.
**Action:** Log the error to the console (or use `logError`) before showing the toast so failures can be debugged.

### `deleteSavedDeck` uses the raw `name` parameter in `confirm()` dialog
**Severity:** Low
**Lines:** 1520
`name` arrives as a string passed from an `onclick` attribute (already `escapeQuotes`-escaped). Inside `confirm()` there is no risk, but the double-escaping means the displayed name may contain literal `\'` sequences if a deck name has an apostrophe.
**Action:** Store the deck name in a data attribute instead of passing it through the onclick string, and retrieve it in `deleteSavedDeck` directly.

## Summary
The section is functional and follows the codebase's try/catch pattern, but lacks an update (PUT) path, never persists battlefield tokens, and passes user data through onclick string arguments which creates double-escaping issues with apostrophes.
