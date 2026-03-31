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

### 11. Gift Ideas & Secret Wish Lists

**Problem:** Birthdays and Christmas trigger a familiar family panic: nobody knows what anyone wants, gifts get duplicated, and last-minute purchases happen without coordination. The bot already tracks birthdays but has no way to capture wishes or coordinate who is buying what.

**Idea:** A private wish list system where each family member can maintain their own list of gift ideas. Other family members can view each other's lists and secretly "claim" an item (the claimant sees it marked; the wish list owner does not). This prevents duplicate gifts and takes the guesswork out of present shopping. Works perfectly alongside the existing birthday tracker.

**Value:** Eliminates duplicate gifts, reduces last-minute panic buying, and gives children a structured way to communicate what they want without spoiling surprises. Especially high value around Christmas and birthdays.

**Use cases:**
- "Add a LEGO Technic set to my wish list" — adds to personal wish list
- "What's on Jake's wish list?" — parent views child's list (claims shown)
- "Claim the LEGO set on Jake's list" — marks as claimed for that family member only; Jake cannot see the claim
- "Show me unclaimed items on Maya's birthday list" — filters to help with purchasing
- "Remove the bike from my wish list — I got it already" — owner manages their own list
- Morning digest in the week before a birthday: "Maya's birthday is in 5 days — 3 unclaimed items on her wish list"

**Integration points:**
- Hooks into existing `birthdays` table to trigger pre-birthday digest nudges
- New LLM tools: `add_wish`, `list_wishes`, `claim_wish`, `unclaim_wish`, `delete_wish`
- New DB tables: `wish_lists` (id, family_id, owner_name, item, notes, url, price_approx, created_at), `wish_claims` (wish_id, claimed_by_user_id, claimed_at)
- Dashboard widget: per-person wish list cards with claim status visible to all except the owner
- No external APIs required

**Implementation notes for next agent:**
- Ownership is stored as `owner_name` (free-text, matching pattern used in `kid_points` and `health_records`) — no foreign key complexity
- Claim privacy is enforced at the query layer: when the requesting user is the owner, `JOIN wish_claims` is omitted from the response
- LLM tool `list_wishes` must accept an optional `for_person` param so parents can query a child's list
- Dashboard API endpoint should return claim status based on the authenticated viewer — simplest MVP: show all claims server-side on the dashboard (dashboard is password-protected, not per-user)
- Pre-birthday digest hook: in `/cron/daily`, check if any birthday is within 7 days and include a wish list summary if unclaimed items exist

---

### 12. Family Recipe Book

**Problem:** The meal planner lets families plan what they will cook, but there is nowhere to store how they cook it. Favourite family recipes live in bookmarks, screenshot folders, or the cook's head. When someone else needs to make a dish, they have to ask — or wing it.

**Idea:** A shared family recipe collection built into the bot. Recipes can be saved from a URL, typed in freeform, or captured from a Telegram message. Each recipe has a name, ingredients list, and method. The recipe book bridges directly to the meal planner: when a meal is planned for a day, the bot can pull the matching recipe on request. Recipes can also auto-populate the shopping list with their ingredients.

**Value:** Creates a shared culinary knowledge base for the family. Reduces the "how do you make it?" question. Deepens the value of the existing meal planner and shopping list features by connecting all three into one coherent cooking workflow.

**Use cases:**
- "Save this recipe: Spaghetti Bolognese — [method typed out]" — freeform capture
- "Save recipe from this URL: [link]" — LLM extracts recipe from fetched page content
- "What's the recipe for the chicken stir-fry?" — retrieval by name
- "Show me the ingredients for tonight's dinner" — pulls recipe matched to meal plan entry
- "Add ingredients for Friday's lasagne to the shopping list" — one-step recipe-to-shopping flow
- "List all our pasta recipes" — browse by ingredient or keyword

**Integration points:**
- Reads from `meal_plans` table to match planned meals to stored recipes by name similarity
- Writes to `lists` / `list_items` (existing) when generating ingredient shopping lists
- New LLM tools: `save_recipe`, `get_recipe`, `list_recipes`, `search_recipes`, `recipe_to_shopping_list`
- New DB tables: `recipes` (id, family_id, name, description, ingredients jsonb, method text, source_url, tags text[], created_by, created_at)
- Dashboard widget: recipe browser with search, showing name, tags, and ingredient count
- URL fetch: use Node's built-in `fetch` to retrieve page HTML; pass to LLM with prompt "extract recipe name, ingredients, and method from this page"

**Implementation notes for next agent:**
- `ingredients` stored as JSONB array of `{name, quantity, unit}` objects — enables structured shopping list generation
- Recipe-to-meal-plan matching uses fuzzy name comparison (LLM can handle this in the tool call rather than requiring exact string match)
- For URL-based saving, fetch the URL server-side (not client-side) to avoid CORS; pass first 8000 chars of body text to LLM for extraction — sufficient for most recipe pages
- `tags` array enables filtering: "pasta", "quick", "vegetarian", "kids-favourite" — populated by LLM at save time
- MVP scope: skip image storage; text-only recipes are sufficient and avoid Telegram file_id complexity

---

### 13. Car & Home Maintenance Tracker

**Problem:** Households accumulate a portfolio of assets that require periodic maintenance — cars needing MOTs and services, a boiler due for its annual check, a roof gutter that needs clearing in autumn. These are forgotten until they become urgent (or illegal). There is no centralised place to track them with proactive reminders.

**Idea:** A structured maintenance log for the household's physical assets. Users register assets (e.g. "Blue Honda Civic", "Boiler", "Garden Shed") and attach maintenance tasks with due dates and recurrence (annual, 6-monthly, mileage-based). The bot sends advance reminders and logs completed work. Works like a household service history in the family's pocket.

**Value:** Prevents costly oversights (driving with an expired MOT, missing a boiler service that voids a warranty). Creates a shared household maintenance record useful when selling a property or car. Removes the mental overhead of remembering irregular-but-important tasks.

**Use cases:**
- "Add our car: Blue Honda Civic, reg AB12 CDE, MOT due 15 June" — registers asset with upcoming task
- "Log that the boiler service was done today — next one due in 12 months" — updates maintenance record
- "What maintenance is due in the next 3 months?" — upcoming task overview
- "Add a task to the Honda: tyre check every 6 months" — recurring maintenance task
- "When was the last time the boiler was serviced?" — history lookup
- Weekly digest includes: "Upcoming maintenance: Honda MOT in 18 days"

**Integration points:**
- Advance reminders hook into existing `/cron/daily` and `/cron/weekly` cron logic (check tasks due within N days)
- New LLM tools: `add_asset`, `list_assets`, `add_maintenance_task`, `log_maintenance_done`, `get_upcoming_maintenance`
- New DB tables: `assets` (id, family_id, name, type, identifier, notes, created_at), `maintenance_tasks` (id, asset_id, family_id, title, last_done_at, next_due_at, recurrence_days, notes), `maintenance_log` (id, task_id, done_by, done_at, notes, cost)
- Dashboard widget: asset list with next-due maintenance highlighted in amber/red by proximity
- No external APIs required (MOT history API is a future enhancement)

**Implementation notes for next agent:**
- `asset.type` enum suggestions: `car`, `appliance`, `property`, `bike`, `other` — used for dashboard icons
- `next_due_at` is recalculated on each `log_maintenance_done` call as `done_at + recurrence_days`
- Cron reminder logic: query `maintenance_tasks WHERE next_due_at <= now() + interval '30 days'` and include in digest; send Telegram alert at 7 days
- `maintenance_log.cost` is optional — enables basic spend tracking per asset over time (future: link to budget tracker)
- MOT due date for cars: store as a specific `next_due_at` with `recurrence_days = 365`; no need for DVLA API in MVP

---

### 14. Homework & Study Tracker

**Problem:** Parents of school-age children often don't know what homework has been set, when it is due, or whether it has been done. Children manage (or mismanage) this themselves. The result is last-minute Sunday-evening panic, missed deadlines, and arguments. The existing school activity tracker (idea #6) handles schedules and clubs but does not address academic workload.

**Idea:** A homework and assignment tracker where children or parents can log homework tasks with a subject, description, and due date. The bot sends reminder nudges in the days before a deadline and marks tasks complete when done. Parents get visibility; children get a personal to-do list they can interact with conversationally. Integrates with the kid rewards system — children can earn points for completing homework on time.

**Value:** Gives parents visibility into academic workload without hovering. Helps children develop self-organisation habits with gentle bot nudges. Connects to the rewards system to motivate timely completion.

**Use cases:**
- "Jake has maths homework due Friday — fractions worksheet" — parent or child logs it
- "What homework does Maya have this week?" — filtered view per child
- "Mark Jake's science project as done" — completion tracking
- "What's overdue?" — surfaces missed deadlines for the whole family
- "Jake earned 5 points for finishing his homework early" — manual reward trigger (or auto-award on completion)
- Daily digest Tuesday–Friday includes: "Homework due this week: Jake — maths (Fri), Maya — history essay (Thu)"

**Integration points:**
- Completion can trigger `addKidPoints` in the existing `kid_points` service — configurable points per completed task
- Due-date reminders hook into `/cron/daily` (day-before alert) and `/cron/weekly` (week's homework summary)
- New LLM tools: `add_homework`, `list_homework`, `complete_homework`, `delete_homework`, `list_overdue_homework`
- New DB tables: `homework` (id, family_id, child_name, subject, description, due_date, completed_at, points_awarded, created_by, created_at)
- Dashboard widget: per-child homework timeline sorted by due date, with overdue items highlighted
- No external APIs required

**Implementation notes for next agent:**
- `child_name` is free-text matching the pattern used in `kid_points` — no foreign key to a children table; keep it simple
- Overdue detection: `due_date < now() AND completed_at IS NULL` — surface in digest with urgency flag
- Points on completion: when `complete_homework` is called, optionally call `addKidPoints(familyId, childName, points, reason)` from the existing `services/kidPoints.js` service — make points amount configurable per task or use a fixed default (e.g. 3 points)
- LLM tool `list_homework` should accept optional `child_name` and `due_before` params for filtered queries
- Keep scope tight: this is a tracker, not a learning platform — no file attachments, no grade recording in MVP

---

### 15. Family Mood & Wellbeing Check-ins

**Problem:** Family life is busy and emotionally complex. Parents and children often don't verbalise stress, tiredness, or low moods until they boil over. There is no lightweight, low-friction way to regularly gauge how everyone is feeling and spot patterns before they become problems.

**Idea:** A daily or weekly opt-in wellbeing check-in system. The bot sends each registered family member a gentle prompt ("How are you feeling today? Rate 1–5 or describe in a word"). Responses are logged privately. The bot surfaces aggregate family mood trends (without exposing individual responses) and, when moods are consistently low, suggests family activities or simply acknowledges the tough period. Parents can optionally see their children's check-ins.

**Value:** Builds emotional awareness into the family routine without requiring vulnerable conversations to happen spontaneously. Leverages the LLM's conversational strengths. Creates a longitudinal mood record that can reveal patterns (stress spikes before school exams, post-holiday dips). Unique to AI-native assistants — no conventional family app does this well.

**Use cases:**
- Daily prompt at 7pm: "Hey Jake, quick check-in — how are you feeling today? (1 = rough, 5 = great, or just tell me)" — low-friction response
- "Show me the family mood this week" — aggregate trend (average scores, any notes)
- "How has Jake been feeling this month?" — parent view of child's check-in history
- "We've noticed a few tough days this week — how about a family movie night tonight?" — LLM-generated suggestion based on low scores
- "Skip check-ins this week" — family member can pause without friction
- Dashboard widget: weekly mood graph per family member (with privacy controls)

**Integration points:**
- Check-in prompts sent via existing Telegram bot DM mechanism — one message per registered user at configured time
- New cron endpoint `/cron/checkin` (or hook into `/cron/daily`) to dispatch prompts
- Groq LLM interprets free-text responses into a numeric score (1–5) + optional sentiment note — reuses existing `groq.js` infrastructure
- New LLM tools: `log_mood_checkin`, `get_mood_history`, `get_family_mood_summary`
- New DB tables: `mood_checkins` (id, family_id, user_id, score int, note text, checked_in_at), `checkin_settings` (family_id, enabled bool, prompt_time time, prompt_days text[])
- Dashboard widget: sparkline mood chart per family member, last-7-days, colour-coded by score
- No external APIs required

**Implementation notes for next agent:**
- Check-in prompt is sent as a Telegram message; response is captured by the standard `messageHandler` — detect check-in response via a pending-state flag stored in `checkin_settings` or a simple `pending_checkins` table (user_id, expires_at)
- LLM scoring prompt: "The user was asked how they're feeling and responded: '[response]'. Rate their mood 1–5 where 1=very low, 5=very positive. Reply with just the number and optionally a one-word sentiment label."
- Privacy model for MVP: parents see children's check-ins; adults' check-ins are private by default (only visible to themselves unless they choose to share)
- Aggregate family summary omits individual breakdowns — LLM narrates the trend: "This week the family mood averaged 3.5/5 — a bit mixed. Wednesday and Thursday were tougher days."
- Opt-in only: check-ins are disabled by default; a family admin enables them via "set up daily check-ins at 7pm"

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
| Gift Wish Lists (#11) | Low | High | 11 — zero-friction, pairs with existing birthdays |
| Recipe Book (#12) | Medium | High | 12 — completes the cooking workflow triangle |
| Homework Tracker (#14) | Low | High | 13 — high utility for school-age families, easy build |
| Car & Home Maintenance (#13) | Medium | Medium | 14 — practical, underserved niche |
| Mood Check-ins (#15) | Medium | High | 15 — unique AI-native feature, opt-in reduces risk |
