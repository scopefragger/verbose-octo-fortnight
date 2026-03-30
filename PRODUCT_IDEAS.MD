# Product Ideas — Telegram Family Assistant Bot

> Generated: 2026-03-30

---

## Context

This is a Telegram-based AI family assistant bot with shared calendar, reminders, shopping lists, meal planning, kid rewards, countdowns, watchlist, food expiry tracking, and a web dashboard. The bot uses Groq (Llama 3.3 70B) for natural language understanding and Supabase (PostgreSQL) for persistence.

---

## Feature Ideas

---

### 1. Family Budget & Expense Tracker

**Problem:** Families currently have no way to track shared spending or household budgets inside the bot.

**Idea:** Allow users to log expenses via natural language ("I spent £45 on groceries today"), assign them to categories (groceries, utilities, eating out, kids, etc.), set monthly budgets per category, and get a running total. Warn when a category approaches its budget limit. Include a budget summary on the family dashboard.

**Key capabilities:**
- Log expenses with amount, category, optional note, and payer
- Set and update monthly budgets per category
- Query spend: "how much have we spent on groceries this month?"
- Weekly digest includes a budget summary
- Dashboard widget showing category spend vs. budget (progress bars)

**Tech notes:** New `expenses` and `budgets` tables. New LLM tool definitions. Lightweight — no external API needed.

---

### 2. Chore Rota & Assignment System

**Problem:** There is no way to assign recurring household chores to specific family members or track who is responsible for what.

**Idea:** A chore management system where chores can be defined (hoover living room, put bins out, clean bathrooms), assigned to family members, given a recurrence schedule, and marked as done. Integrates with the kid rewards system so children earn points for completing assigned chores.

**Key capabilities:**
- Create chores with name, assigned person, recurrence (daily/weekly/fortnightly)
- List pending chores for the day/week, filtered by person
- Mark a chore as done (optionally auto-award kid points)
- Overdue chore alerts via cron (morning digest)
- Dashboard widget showing today's chores and responsible person

**Tech notes:** New `chores` and `chore_completions` tables. Hook into existing reminders cron and kid points system.

---

### 3. Family Photo & Memory Log

**Problem:** Important family moments, milestones, and memories are scattered across phones with no shared log.

**Idea:** Let family members send a photo or text to the bot with a caption and optional date to save it as a "memory". Memories can be tagged (holiday, birthday, milestone) and queried ("show me memories from Christmas"). A "on this day" daily digest message surfaces memories from the same date in previous years.

**Key capabilities:**
- Save a memory from a Telegram photo or text message
- Tag memories with categories and optional date override
- Query memories: "show me holiday memories" or "memories from last summer"
- "On this day" feature — morning digest includes past memories from the same day/week
- Dashboard memory gallery section (thumbnails with captions)

**Tech notes:** New `memories` table with Telegram `file_id` for photo storage (Telegram hosts the file). No external storage needed for MVP.

---

### 4. Shared Notes & Quick Reference Cards

**Problem:** The bot has lists (for shopping) but no way to store freeform shared knowledge — Wi-Fi passwords, school contact numbers, bin collection days, insurance policy numbers, etc.

**Idea:** A shared family notes system for storing freeform reference information. Notes are named and searchable. Think of it as a family wiki — quickly ask "what's the Wi-Fi password?" or "what's the school's phone number?" and the bot retrieves the right note.

**Key capabilities:**
- Save a named note: "save a note called wifi — BT Hub password is Xyz123"
- Retrieve by name or natural language search: "what's the Netflix login?"
- List all note names
- Delete or update notes
- Optionally mark notes as sensitive (masked in dashboard display)

**Tech notes:** New `notes` table (name, content, is_sensitive, family_id). LLM tool definitions for CRUD. Semantic search via embeddings is a future enhancement; fuzzy text matching is sufficient for MVP.

---

### 5. AI-Powered Weekly Family Planner Summary

**Problem:** The bot holds a lot of family data (events, meals, chores, reminders, birthdays) but there is no unified "what's happening this week?" digest that synthesises it all into a coherent, human-readable plan.

**Idea:** Every Sunday evening (or on demand), the bot generates a personalised weekly preview by pulling together the week's calendar events, meal plan, pending reminders, upcoming birthdays, and any chores or countdowns. The LLM narrates it as a friendly summary rather than a dry data dump — highlighting conflicts, missing meal slots, and anything needing attention.

**Key capabilities:**
- On-demand command: "give me the plan for this week"
- Auto-send as Sunday evening digest (configurable time)
- LLM synthesises all data sources into a coherent narrative
- Flags gaps (e.g. no dinner planned Thursday) and conflicts (two events same time)
- Personalised per user (includes their personal reminders + shared family data)
- Shareable: optionally post the summary to a family group chat

**Tech notes:** New `/cron/weekly-preview` endpoint. Orchestration logic calls multiple existing service functions, passes aggregated data to LLM for narrative generation. No new DB tables required.

---

## Prioritisation Notes

| Idea | Effort | Impact | Recommended Priority |
|---|---|---|---|
| Weekly Planner Summary | Low | High | 1 — quick win, leverages existing data |
| Chore Rota | Medium | High | 2 — fills obvious gap, integrates with kid rewards |
| Budget Tracker | Medium | High | 3 — high value for most families |
| Shared Notes | Low | Medium | 4 — simple but useful utility |
| Photo Memory Log | Medium | Medium | 5 — delightful but non-essential |
