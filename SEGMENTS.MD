# MTG Commander — Code Segments

File: `public/mtg-commander.html` (2159 lines)
Single-file app — embedded CSS, HTML, and JavaScript.

---

## JavaScript (Lines 1031–2157)

| # | Section | Lines | Description |
|---|---------|-------|-------------|
| 23 | Utilities | 2141–2156 | `escapeHtml()`, `escapeQuotes()`, `formatManaCostShort()`, `showToast()` |

---

## Supporting Files

| File | Description |
|------|-------------|
| `index.js` | Express routes: `GET /mtg-commander`, `GET/POST/PUT/DELETE /api/mtg/decks`, `POST /api/mtg/critique-hand` |
| `services/mtgCommander.js` | Supabase CRUD: `listDecklists`, `getDecklist`, `saveDecklist`, `updateDecklist`, `deleteDecklist` |
| `db/migrations/023_mtg_decklists.sql` | Table: `mtg_decklists(id, family_id, name, commander, partner, cards JSONB, tokens JSONB, created_at, updated_at)` |
| `llm/groq.js` | `chatCompletion()` wrapper — used for hand critique via `llama-3.3-70b-versatile` |
