# MTG Commander — Code Segments

File: `public/mtg-commander.html` (2159 lines)
Single-file app — embedded CSS, HTML, and JavaScript.

---

## JavaScript (Lines 1031–2157)

| # | Section | Lines | Description |
|---|---------|-------|-------------|
| 8 | Stats | 1196–1287 | `renderStats()` — CMC average, mana curve bars, color identity pips, type breakdown |
| 9 | Deck List | 1289–1323 | `renderDeckList()` — groups cards by type, renders sorted list |
| 10 | Hand Simulator | 1325–1432 | `buildDrawPile()`, `shuffle()`, `drawHand()`, `mulligan()`, `keepHand()`, `critiqueHand()` (Groq), `renderHand()` |
| 11 | Card Detail Modal | 1434–1452 | `showCardDetail()`, `closeModal()` |
| 12 | Save / Load | 1454–1529 | `saveDeck()`, `loadSavedDecks()`, `loadDeckFromSaved()`, `deleteSavedDeck()` — REST API calls |
| 13 | Mode Toggle | 1531–1545 | `setMode()` switches between Prepare/Play views; `toggleSidebar()` |
| 14 | Play State | 1547–1641 | Play-mode variables (`playHand[]`, `playBattlefield[]`, `manaPool{}`); `parseMana()`, `canAfford()`, `spendMana()`, `renderManaPool()`, `clearManaPool()` |
| 15 | Token Definitions | 1647–1662 | `COMMON_TOKENS` array — preset token data |
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
