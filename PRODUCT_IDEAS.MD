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

---

### 6. School & After-School Activity Tracker

**Problem:** Families with children juggle a complex web of school events, after-school clubs, pickup schedules, and homework deadlines. This information is currently scattered across school newsletters, WhatsApp groups, and individual memory. The bot's shared calendar can store events but has no concept of child-specific schedules, recurring club sessions, or pickup responsibilities.

**Idea:** A dedicated child activity management layer on top of the existing calendar. Each child in the family can have a weekly activity schedule (e.g. "Maya has swimming Tuesdays at 4pm, football Thursdays at 5:30pm"). The bot tracks who is responsible for pickup on a given day and surfaces morning reminders like "Maya has football today at 5:30 — you're on pickup." School-wide events (parents' evening, sports day, inset days) are stored separately and flagged in digests.

**Value:** Eliminates the mental load of tracking kids' schedules. The responsible-parent rotation system prevents the classic "I thought you were picking her up!" scenario.

**Use cases:**
- "Add Maya's swimming lesson every Tuesday at 4pm" — creates recurring activity
- "Who's picking up Jake tomorrow?" — bot resolves pickup responsibility
- "What activities does Maya have this week?" — filtered weekly view per child
- "Add parents' evening on April 15th at 6pm" — school event, flagged in digest
- Morning digest includes "Today: Jake has rugby at 4:30, you're on pickup"

**Integration points:**
- Extends existing `kid_points` / kids concept — reuses `display_name` to identify children
- Hooks into the existing daily digest cron (`/cron/daily`) for morning activity reminders
- New LLM tools: `add_activity`, `list_activities`, `set_pickup`, `get_today_activities`
- New DB tables: `child_activities` (child_name, title, day_of_week, time, recurrence, family_id), `school_events` (title, date, notes, family_id)
- No external APIs required

**Implementation notes for next agent:**
- `child_activities` table mirrors structure of `reminders` — reuse recurrence logic
- Pickup assignment is a simple round-robin or manual override stored per activity instance
- Dashboard widget: today's activity timeline per child, colour-coded by child

---

### 7. Family Polls & Quick Decisions

**Problem:** Many family decisions — where to eat Friday night, what film to watch, where to go for a day out — require a quick group vote. Currently these happen informally across multiple messages with no resolution mechanism. The bot has no way to collect structured input from multiple family members and report a winner.

**Idea:** A lightweight polling system native to Telegram. Any family member asks the bot to create a poll ("poll: where should we go Saturday? — beach, theme park, city break"), the bot posts the question with numbered options to the family group chat. Family members reply with their choice (or tap an inline button). After a set time or when all members have voted, the bot announces the winner and logs the decision.

**Value:** Turns a messy group chat discussion into a structured, fast decision. Reduces back-and-forth and ensures everyone has a voice.

**Use cases:**
- "Create a poll: what's for dinner tonight? Pizza / Curry / Pasta" — instant vote
- "Poll: which film for movie night? Moana / Frozen / Encanto" — kid-friendly voting
- "What did we vote for last Friday's dinner?" — history lookup
- Inline Telegram buttons for one-tap voting (no typing required)
- Automatic result announcement when all family members have voted

**Integration points:**
- Requires group chat support — uses existing `family_group_chat_id` stored on the family
- grammy's inline keyboard API for button-based voting (already used for some responses)
- New LLM tools: `create_poll`, `get_poll_result`, `list_recent_polls`
- New DB tables: `polls` (question, options[], status, created_by, family_id, expires_at), `poll_votes` (poll_id, user_id, choice)
- No external APIs required

**Implementation notes for next agent:**
- Poll creation sends an `InlineKeyboard` message to the group chat via grammy's `bot.api.sendMessage`
- `callback_query` handler intercepts button taps and records the vote in `poll_votes`
- Auto-close logic: cron job (or callback check) detects when all family members have voted and posts the result
- Edge case: handle users who haven't voted after 24h — send a nudge or auto-close with partial results

---

### 8. Pet Care Tracker

**Problem:** Families with pets manage recurring care tasks — medication schedules, vet appointments, flea/worming treatments, feeding routines — with no structured tracking. These are currently remembered individually and can be missed, especially for medications with strict schedules.

**Idea:** A pet profile and care log within the bot. Each pet has a name, species, and a set of recurring care tasks (medication every morning, flea treatment monthly, vet checkup every 6 months). The bot sends reminders for upcoming treatments and logs when they were last administered. Vet appointments go into the shared family calendar. The daily digest can include a "pet care today" section when relevant.

**Value:** Prevents missed medications and vet appointments. Removes the "did you give the dog his tablet?" ambiguity by logging who administered what and when.

**Use cases:**
- "Add our dog Biscuit to the pets" — creates pet profile
- "Biscuit needs flea treatment every 4 weeks — next one is April 10th" — recurring care task
- "Log that I gave Biscuit his morning tablet" — records administration with timestamp
- "When did Biscuit last have his flea treatment?" — history query
- "Biscuit has a vet appointment on April 22nd at 10am" — adds to shared calendar

**Integration points:**
- Vet appointments use existing `create_event` service — no duplication needed
- Pet medication reminders hook into the existing `reminders` infrastructure (or a lightweight parallel)
- New LLM tools: `add_pet`, `list_pets`, `add_pet_care_task`, `log_pet_care`, `get_pet_care_history`
- New DB tables: `pets` (name, species, breed, dob, family_id), `pet_care_tasks` (pet_id, task_name, frequency_days, last_done_at, next_due_at), `pet_care_log` (task_id, done_by, done_at, note)
- Dashboard widget: pet profiles with next-due care tasks highlighted

**Implementation notes for next agent:**
- `next_due_at` is calculated as `last_done_at + frequency_days` and updated on each log entry
- Cron reminder check (`/cron/check`) should query `pet_care_tasks` where `next_due_at <= now + 1 day`
- Keep pet profiles lightweight for MVP — name, species, and care tasks only; avoid scope creep into medical records

---

### 9. Smart Meal-to-Shopping List Generator

**Problem:** The bot already has a meal planner and a shopping list feature, but they are completely disconnected. Users manually add grocery items without reference to what meals are planned. This creates duplication of effort and missed ingredients.

**Idea:** An AI-powered bridge between the meal plan and the shopping list. When a user asks "generate my shopping list for this week", the bot reads the weekly meal plan, uses the LLM to infer the likely ingredients for each meal, cross-references items already in the fridge (food expiry tracker), and produces a suggested shopping list. The user can approve, edit, and push it directly to a named list in one step.

**Value:** Eliminates the manual effort of translating a meal plan into a grocery list. Reduces food waste by accounting for what's already in the fridge. Saves 10-15 minutes of weekly planning.

**Use cases:**
- "Generate my shopping list from this week's meal plan" — AI infers ingredients
- "Add missing ingredients for Wednesday's meals to the grocery list" — partial generation
- "What do I need to buy for this week's dinners?" — conversational trigger
- Cross-reference food expiry tracker: "You already have milk (3 days left) and eggs (2)"
- One-tap confirmation: "Add these 12 items to the grocery list? [Yes / Edit first]"

**Integration points:**
- Reads from `meals` table (existing) and `food_items` table (existing expiry tracker)
- Writes to `lists` / `list_items` tables (existing)
- LLM does ingredient inference — no recipe API needed for MVP (Llama 3.3 70B is capable)
- New LLM tool: `generate_shopping_list_from_meals` with optional `date_from`, `date_to`, `list_name` params
- No new DB tables required — orchestration only

**Implementation notes for next agent:**
- Fetch weekly meals via `getMeals(familyId, startDate, endDate)`
- Fetch current food items via `listFoodItems(familyId)` to pass as context
- Build a single LLM prompt: "Given these meals: [...] and these items already in the fridge: [...], list the groceries needed"
- Parse LLM response as a structured list, then call `addListItem` for each confirmed item
- Confirmation step is important — use a simple "reply YES to confirm" pattern before writing to the list

---

### 10. Family Health & Medical Records Hub

**Problem:** Important health information — GP appointments, repeat prescriptions, vaccination records, children's medical history — is scattered across NHS letters, apps, and individual memory. When one parent needs to take a child to the GP, the other parent's knowledge of the child's medical history is not easily accessible.

**Idea:** A secure, family-shared health reference system. Not a full medical record (out of scope), but a practical reference layer: upcoming medical appointments, repeat prescription due dates, vaccination history per family member, and key health notes (allergies, blood type, current medications). All data stays in the family's private Supabase instance and is never sent to external services.

**Value:** Creates a shared source of truth for family health admin. Ensures both parents can access critical health information in an emergency. Reduces the friction of managing NHS appointments and prescription repeats.

**Use cases:**
- "Add Jake's MMR vaccination on April 5th" — logs vaccination record
- "When is Emily's next GP appointment?" — quick lookup
- "Set a reminder to re-order Jake's inhaler in 3 weeks" — prescription repeat reminder
- "What allergies does Maya have on record?" — health notes lookup
- "Add my blood type as A+" — personal health note

**Integration points:**
- Medical appointments use existing `create_event` for scheduling + new `health_records` table for structured data
- Prescription reminders reuse existing `reminders` infrastructure
- New LLM tools: `add_health_record`, `get_health_records`, `add_vaccination`, `get_vaccinations`, `add_allergy`
- New DB tables: `health_records` (family_member, record_type, title, date, notes, family_id), `vaccinations` (family_member, vaccine_name, date_given, next_due, family_id)
- Dashboard section: per-person health summary (upcoming appointments, overdue vaccinations)

**Implementation notes for next agent:**
- `family_member` field is a free-text name (not a foreign key) for simplicity — matches the pattern used in `kid_points`
- Sensitive data flag: health records should be excluded from any LLM context summaries to avoid accidentally leaking medical info into conversation history
- For MVP, skip the dashboard display of sensitive health data and surface it only via direct bot queries
- Vaccination due-date tracking: `next_due` field on vaccinations table, surfaced in weekly digest when within 30 days

---

## Prioritisation Notes

| Idea | Effort | Impact | Recommended Priority |
|---|---|---|---|
| Weekly Planner Summary (#5) | Low | High | 1 — quick win, leverages existing data |
| Chore Rota (#2) | Medium | High | 2 — fills obvious gap, integrates with kid rewards |
| Budget Tracker (#1) | Medium | High | 3 — high value for most families |
| Smart Shopping List (#9) | Low | High | 4 — zero new tables, high daily utility |
| Shared Notes (#4) | Low | Medium | 5 — simple but useful utility |
| School Activity Tracker (#6) | Medium | High | 6 — essential for families with kids |
| Family Polls (#7) | Low | Medium | 7 — fun, Telegram-native, quick to build |
| Pet Care Tracker (#8) | Medium | Medium | 8 — niche but high value for pet owners |
| Photo Memory Log (#3) | Medium | Medium | 9 — delightful but non-essential |
| Health Records Hub (#10) | High | High | 10 — high value but sensitive data adds complexity |
