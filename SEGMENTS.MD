# MTG Commander — Code Segments

File: `public/mtg-commander.html` (2159 lines)
Single-file app — embedded CSS, HTML, and JavaScript.

---

## CSS (Lines 7–772)

| # | Section | Lines | Description |
|---|---------|-------|-------------|
| 15 | Deck List View | 500–535 | Type-grouped card list with qty and mana cost display |
| 19 | Play Area | 559–565 | Play area grid positioning, hidden-by-default state |
| 20 | Play Controls Bar | 567–580 | Turn counter, life total ± buttons, mana pool display, action buttons |
| 21 | Battlefield & Card Zones | 581–636 | Permanents/Lands zone containers, card wrap, card image, token rendering |
| 22 | Card Context Menu | 647–658 | Right-click context menu positioning and item styles |
| 23 | Card Focus Panel | 660–695 | Bottom slide-up panel for selected card with action buttons |
| 24 | Graveyard Bar | 696–706 | Graveyard / Exile zone counter buttons |
| 25 | Play Hand Strip | 708–731 | Hand card strip at bottom of play area |
| 26 | Token Modal | 733–771 | Token creation modal, preset buttons, custom P/T inputs |

---

## HTML (Lines 774–1030)

| # | Section | Lines | Description |
|---|---------|-------|-------------|
| 1 | Header Bar | 776–783 | Title, deck card count, Prepare/Play mode buttons |
| 2 | Main Layout Wrapper | 785–965 | Root grid container for all panels |
| 3 | Sidebar — Import Pane | 796–829 | Deck name, commander/partner inputs, decklist textarea, Import/Clear buttons |
| 4 | Sidebar — Deck List Pane | 832–838 | Save/Edit buttons, rendered card list |
| 5 | Sidebar — Saved Decks Pane | 841–843 | Container for loaded saved deck list |
| 6 | Stats Panel | 847–873 | Stats grid, mana curve, color pips, type bars |
| 7 | Hand Simulator Panel | 876–895 | Draw/Mulligan toolbar, hand card grid, Groq critique output |
| 8 | Play Area | 898–963 | Controls bar, Permanents zone, Lands zone, card focus panel, graveyard/exile bar, hand strip |
| 9 | Card Context Menu | 966–979 | Inline context menu markup |
| 10 | Token Modal | 982–999 | Token preset grid, custom token form |
| 11 | Graveyard Viewer Modal | 1001–1010 | Overlay for browsing graveyard/exile |
| 12 | Card Detail Modal | 1013–1026 | Large card image + info overlay |
| 13 | Toast Element | 1029 | Single toast notification container |

---

## JavaScript (Lines 1031–2157)

| # | Section | Lines | Description |
|---|---------|-------|-------------|
| 1 | State | 1032–1037 | `deck[]`, `hand[]`, `mulliganCount`, `cardCache` — shared prepare-mode state |
| 2 | URL Secret | 1039–1048 | Reads `?secret=` param from URL for API auth; `apiFetch()` wrapper |
| 3 | Init | 1050–1055 | `DOMContentLoaded` — sets up autocomplete |
| 4 | Navigation | 1057–1069 | `goBack()`, `switchTab()` |
| 5 | Decklist Parser | 1071–1086 | Regex parser for `1 Card Name` / `1x Card Name` format |
| 6 | Scryfall Fetch | 1088–1145 | `fetchCard()` (single/fuzzy), `fetchCards()` (batch collection + miss retry), response caching |
| 7 | Import | 1147–1194 | `importDecklist()`, `clearDeck()` — calls Scryfall, populates `deck[]` |
| 8 | Stats | 1196–1287 | `renderStats()` — CMC average, mana curve bars, color identity pips, type breakdown |
| 9 | Deck List | 1289–1323 | `renderDeckList()` — groups cards by type, renders sorted list |
| 10 | Hand Simulator | 1325–1432 | `buildDrawPile()`, `shuffle()`, `drawHand()`, `mulligan()`, `keepHand()`, `critiqueHand()` (Groq), `renderHand()` |
| 11 | Card Detail Modal | 1434–1452 | `showCardDetail()`, `closeModal()` |
| 12 | Save / Load | 1454–1529 | `saveDeck()`, `loadSavedDecks()`, `loadDeckFromSaved()`, `deleteSavedDeck()` — REST API calls |
| 13 | Mode Toggle | 1531–1545 | `setMode()` switches between Prepare/Play views; `toggleSidebar()` |
| 14 | Play State | 1547–1641 | Play-mode variables (`playHand[]`, `playBattlefield[]`, `manaPool{}`); `parseMana()`, `canAfford()`, `spendMana()`, `renderManaPool()`, `clearManaPool()` |
| 15 | Token Definitions | 1647–1662 | `COMMON_TOKENS` array — preset token data |
| 16 | Play Core | 1664–1841 | `startGame()`, `gameDrawCard()`, `changeLife()`, `untapAll()`, `endTurn()`, `playCardToBattlefield()`, `tapCard()`, `showManaChoicePicker()`, `sendToGrave()`, `sendToExile()`, `returnToHand()`, `putOnTop()`, `playHandCardFromFocus()`, `discardFromHand()` |
| 17 | Render Play Area | 1858–1923 | `renderPlayArea()`, `renderBattlefield()`, `renderPlayHand()` — HTML generation for battlefield and hand |
| 18 | Card Focus Panel | 1925–1994 | `selectBFCard()`, `closeFocusPanel()`, `selectHandCard()` — panel population and action wiring |
| 19 | Context Menu | 1996–2021 | `showCtxMenu()`, `ctxAction()`, global click dismissal |
| 20 | Token Modal | 2023–2038 | `showTokenModal()`, `closeTokenModal()`, `addToken()` |
| 21 | Graveyard Viewer | 2040–2054 | `showGraveViewer()` — renders graveyard/exile modal content |
| 22 | Commander Autocomplete | 2056–2139 | `setupAutocomplete()`, `fetchSuggestions()`, `selectCommander()`, `hideDropdown()` — Scryfall autocomplete for commander inputs |
| 23 | Utilities | 2141–2156 | `escapeHtml()`, `escapeQuotes()`, `formatManaCostShort()`, `showToast()` |

---

## Supporting Files

| File | Description |
|------|-------------|
| `index.js` | Express routes: `GET /mtg-commander`, `GET/POST/PUT/DELETE /api/mtg/decks`, `POST /api/mtg/critique-hand` |
| `services/mtgCommander.js` | Supabase CRUD: `listDecklists`, `getDecklist`, `saveDecklist`, `updateDecklist`, `deleteDecklist` |
| `db/migrations/023_mtg_decklists.sql` | Table: `mtg_decklists(id, family_id, name, commander, partner, cards JSONB, tokens JSONB, created_at, updated_at)` |
| `llm/groq.js` | `chatCompletion()` wrapper — used for hand critique via `llama-3.3-70b-versatile` |
