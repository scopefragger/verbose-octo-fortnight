# Agents Plan — MTG Commander Code Review

## Context

The MTG Commander tool (`public/mtg-commander.html`) is a single-file app (2159 lines) with embedded CSS, HTML, and JavaScript. A structured 4-lens code review is underway. Each segment of the file is reviewed one at a time using the `/review-segment` skill. 31 segments have been completed. 45 segments remain across CSS, HTML, and JavaScript blocks.

This plan outlines which files agents should review, where review guidance lives, and where to find the current state of work.

---

## Where to Find What Needs to Be Done

- **`SEGMENTS.MD`** — tracks all remaining segments to review. Each row in the tables is one pending review. Rows are deleted as segments are completed.
- **31 completed** reviews already exist in `code-review/` subdirectories.
- **45 segments remain** (9 CSS + 13 HTML + 23 JavaScript).

---

## Where the Code Review Guidance Is

- **`.claude/commands/review-segment.md`** — the full skill definition. Contains:
  - How to pick the next segment from `SEGMENTS.MD`
  - How to read the target code lines from `public/mtg-commander.html`
  - The four review lenses (Static, Security, Architecture, Patterns)
  - Output format for `code-review/<section_name>/` (4 markdown files per segment)
  - How to remove the processed row from `SEGMENTS.MD`
- **`CLAUDE.md`** — project-wide patterns and architecture (XSS via `esc()`, service layer, auth pattern, etc.) — use as reference for what "correct" looks like in this codebase.

---

## Files Agents Need to Review

### Primary Target File
- **`public/mtg-commander.html`** (2159 lines) — the file all segments are drawn from.

### Supporting Files (review alongside relevant segments)
- **`index.js`** — Express routes: `GET /mtg-commander`, `GET/POST/PUT/DELETE /api/mtg/decks`, `POST /api/mtg/critique-hand`
- **`services/mtgCommander.js`** — Supabase CRUD: `listDecklists`, `getDecklist`, `saveDecklist`, `updateDecklist`, `deleteDecklist`
- **`db/migrations/023_mtg_decklists.sql`** — Table schema for `mtg_decklists`
- **`llm/groq.js`** — `chatCompletion()` wrapper (used by the hand critique feature)

---

## Remaining Segments to Review (from `SEGMENTS.MD`)

### CSS (9 segments remaining)

- **#15** `css-deck-list-view` — Lines 500–535 — Type-grouped card list with qty and mana cost display
- **#19** `css-play-area` — Lines 559–565 — Play area grid positioning, hidden-by-default state
- **#20** `css-play-controls-bar` — Lines 567–580 — Turn counter, life total ± buttons, mana pool display, action buttons
- **#21** `css-battlefield-and-card-zones` — Lines 581–636 — Permanents/Lands zone containers, card wrap, card image, token rendering
- **#22** `css-card-context-menu` — Lines 647–658 — Right-click context menu positioning and item styles
- **#23** `css-card-focus-panel` — Lines 660–695 — Bottom slide-up panel for selected card with action buttons
- **#24** `css-graveyard-bar` — Lines 696–706 — Graveyard / Exile zone counter buttons
- **#25** `css-play-hand-strip` — Lines 708–731 — Hand card strip at bottom of play area
- **#26** `css-token-modal` — Lines 733–771 — Token creation modal, preset buttons, custom P/T inputs

### HTML (13 segments remaining)

- **#1** `html-header-bar` — Lines 776–783 — Title, deck card count, Prepare/Play mode buttons
- **#2** `html-main-layout-wrapper` — Lines 785–965 — Root grid container for all panels
- **#3** `html-sidebar-import-pane` — Lines 796–829 — Deck name, commander/partner inputs, decklist textarea, Import/Clear buttons
- **#4** `html-sidebar-deck-list-pane` — Lines 832–838 — Save/Edit buttons, rendered card list
- **#5** `html-sidebar-saved-decks-pane` — Lines 841–843 — Container for loaded saved deck list
- **#6** `html-stats-panel` — Lines 847–873 — Stats grid, mana curve, color pips, type bars
- **#7** `html-hand-simulator-panel` — Lines 876–895 — Draw/Mulligan toolbar, hand card grid, Groq critique output
- **#8** `html-play-area` — Lines 898–963 — Controls bar, Permanents zone, Lands zone, card focus panel, graveyard/exile bar, hand strip
- **#9** `html-card-context-menu` — Lines 966–979 — Inline context menu markup
- **#10** `html-token-modal` — Lines 982–999 — Token preset grid, custom token form
- **#11** `html-graveyard-viewer-modal` — Lines 1001–1010 — Overlay for browsing graveyard/exile
- **#12** `html-card-detail-modal` — Lines 1013–1026 — Large card image + info overlay
- **#13** `html-toast-element` — Line 1029 — Single toast notification container

### JavaScript (23 segments remaining)

- **#1** `js-state` — Lines 1032–1037 — `deck[]`, `hand[]`, `mulliganCount`, `cardCache` shared prepare-mode state
- **#2** `js-url-secret` — Lines 1039–1048 — `?secret=` param reading + `apiFetch()` wrapper
- **#3** `js-init` — Lines 1050–1055 — `DOMContentLoaded` autocomplete setup
- **#4** `js-navigation` — Lines 1057–1069 — `goBack()`, `switchTab()`
- **#5** `js-decklist-parser` — Lines 1071–1086 — Regex parser for `1 Card Name` / `1x Card Name`
- **#6** `js-scryfall-fetch` — Lines 1088–1145 — `fetchCard()`, `fetchCards()`, response caching
- **#7** `js-import` — Lines 1147–1194 — `importDecklist()`, `clearDeck()`
- **#8** `js-stats` — Lines 1196–1287 — `renderStats()` — CMC average, mana curve, color pips, type breakdown
- **#9** `js-deck-list` — Lines 1289–1323 — `renderDeckList()` — groups by type, sorted list
- **#10** `js-hand-simulator` — Lines 1325–1432 — `buildDrawPile()`, `shuffle()`, `drawHand()`, `mulligan()`, `critiqueHand()`, `renderHand()`
- **#11** `js-card-detail-modal` — Lines 1434–1452 — `showCardDetail()`, `closeModal()`
- **#12** `js-save-load` — Lines 1454–1529 — `saveDeck()`, `loadSavedDecks()`, `loadDeckFromSaved()`, `deleteSavedDeck()` — REST API calls
- **#13** `js-mode-toggle` — Lines 1531–1545 — `setMode()`, `toggleSidebar()`
- **#14** `js-play-state` — Lines 1547–1641 — `playHand[]`, `playBattlefield[]`, `manaPool{}`, `parseMana()`, `canAfford()`, `spendMana()`, `renderManaPool()`
- **#15** `js-token-definitions` — Lines 1647–1662 — `COMMON_TOKENS` preset array
- **#16** `js-play-core` — Lines 1664–1841 — `startGame()`, `gameDrawCard()`, `changeLife()`, `untapAll()`, `endTurn()`, `playCardToBattlefield()`, `tapCard()`, `sendToGrave()`, `sendToExile()`, `returnToHand()`, `putOnTop()`, etc.
- **#17** `js-render-play-area` — Lines 1858–1923 — `renderPlayArea()`, `renderBattlefield()`, `renderPlayHand()`
- **#18** `js-card-focus-panel` — Lines 1925–1994 — `selectBFCard()`, `closeFocusPanel()`, `selectHandCard()`
- **#19** `js-context-menu` — Lines 1996–2021 — `showCtxMenu()`, `ctxAction()`, global click dismissal
- **#20** `js-token-modal` — Lines 2023–2038 — `showTokenModal()`, `closeTokenModal()`, `addToken()`
- **#21** `js-graveyard-viewer` — Lines 2040–2054 — `showGraveViewer()`
- **#22** `js-commander-autocomplete` — Lines 2056–2139 — `setupAutocomplete()`, `fetchSuggestions()`, `selectCommander()`
- **#23** `js-utilities` — Lines 2141–2156 — `escapeHtml()`, `escapeQuotes()`, `formatManaCostShort()`, `showToast()`

---

## How to Run

1. Invoke the skill: `/review-segment`
2. Each invocation processes the **first remaining row** in `SEGMENTS.MD`, reviews it, writes 4 files to `code-review/<section_name>/`, and removes the row.
3. Agents must run **sequentially** — `SEGMENTS.MD` is mutated per run, so parallel runs will conflict.
4. After all 45 segments are processed, `SEGMENTS.MD` will be empty and `code-review/` will contain the full review corpus.

---

## Output Location

- **`code-review/<section_name>/static.md`** — static analysis findings
- **`code-review/<section_name>/security.md`** — XSS, injection, secrets findings
- **`code-review/<section_name>/architecture.md`** — coupling, responsibility, duplication findings
- **`code-review/<section_name>/patterns.md`** — magic numbers, complexity, consistency findings
