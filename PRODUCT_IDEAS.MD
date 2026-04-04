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

---

### 16. Family Travel & Holiday Planner

**Problem:** Planning a family holiday involves dozens of moving parts — flights, accommodation, activities, packing lists, travel documents, and booking references — scattered across email inboxes, browser bookmarks, and multiple apps. There is no single family-shared place to store, surface, and prepare for a trip.

**Value:** Creates a single trip-planning hub the whole family can query and contribute to. Reduces pre-holiday stress by surfacing checklists, countdowns, and document reminders automatically. Complements the existing countdown and calendar features without duplicating them.

**Use cases:**
- "Create a trip: Tenerife, 12–19 August" — creates a trip record with auto-generated countdown in the existing `countdowns` table
- "Add our flight booking ref: BA2841, departs 06:30 Gatwick" — stores booking detail against the trip
- "What documents do we need for Tenerife?" — LLM generates a country-appropriate document checklist (passports, EHIC, travel insurance)
- "Start a packing list for the Tenerife trip" — creates a named list in the existing `lists` system, pre-seeded by LLM with trip-appropriate suggestions
- "What's our hotel address in Tenerife?" — retrieves stored booking detail
- "When do passports expire?" — queries stored document expiry dates; alerts if a passport expires before the trip

**Integration points:**
- Countdown for each trip stored in existing `countdowns` table — no duplication
- Packing lists stored in existing `lists`/`list_items` tables — reuses all existing list tooling
- New LLM tools: `create_trip`, `get_trip`, `list_trips`, `add_booking_detail`, `add_document`, `get_packing_suggestions`
- New DB tables: `trips` (id, family_id, name, destination, depart_date, return_date, notes, created_at), `trip_details` (id, trip_id, detail_type, label, value, expiry_date), where `detail_type` is one of `booking`, `document`, `accommodation`, `activity`, `note`
- Dashboard widget: upcoming trips card with countdown, next action item, and quick-access booking refs

**Implementation notes for next agent:**
- `trip_details` uses a flexible key-value model (`label`, `value`) rather than fixed columns — accommodates the varied nature of travel information without schema changes per detail type
- Passport/document expiry alerts: cron job queries `trip_details WHERE detail_type = 'document' AND expiry_date < trip.depart_date - interval '6 months'` (most countries require 6 months validity) and sends an alert
- Packing list seeding: when `create_trip` is called, the LLM tool optionally calls `generate_packing_suggestions(destination, duration_days, month)` — returns a categorised list (clothing, toiletries, documents, kids' items) which the user can push to a list with one confirmation
- Link trip countdown to `trips.depart_date` so it auto-populates without requiring a separate countdown creation step
- MVP scope: no API integrations (no flight lookup, no Skyscanner) — all data is manually entered; the value is in the aggregation and AI-assisted checklists

---

### 17. Pocket Money & Allowance Manager

**Problem:** The bot has a kid rewards/points system for tracking achievements, but no mechanism for real-world money. Families managing pocket money for children have no shared record of what has been paid, what children have saved, and what they have spent. This leads to "you never gave me this week's pocket money" disputes and missed savings goals.

**Value:** Creates a transparent, shared record of children's finances. Builds financial literacy habits early. Directly extends the existing kid points system with a monetary dimension. Prevents disagreements with an auditable payment log.

**Use cases:**
- "Set Jake's pocket money to £5 every Friday" — configures recurring allowance with a reminder
- "Pay pocket money to all kids" — logs this week's payment for all configured children
- "Jake spent £3.50 at the school fair" — logs a debit against Jake's balance
- "How much has Maya saved?" — current balance query
- "Maya wants to save for a LEGO set that costs £35 — how many weeks until she can buy it?" — savings goal calculation
- "Show pocket money history for Jake this month" — transaction ledger view

**Integration points:**
- Recurring payment reminders hook into existing reminder cron (`/cron/check`) — allowance day triggers a Telegram alert to the parent
- Savings goal tracking pairs naturally with the existing `countdowns` concept — a countdown to "Maya can afford the LEGO set"
- New LLM tools: `set_allowance`, `pay_allowance`, `log_spend`, `get_balance`, `get_transaction_history`, `set_savings_goal`, `check_savings_goal`
- New DB tables: `allowances` (id, family_id, child_name, amount decimal, currency, frequency, next_due_date), `pocket_money_transactions` (id, family_id, child_name, amount decimal, type enum('credit','debit'), note, created_by, created_at), `savings_goals` (id, family_id, child_name, goal_name, target_amount, created_at)
- Dashboard widget: per-child balance card with recent transactions and savings goal progress bar

**Implementation notes for next agent:**
- Balance is computed as `SUM(amount) WHERE type='credit' - SUM(amount) WHERE type='debit'` — no stored balance column, always derived to prevent drift
- `allowances.next_due_date` is updated on each payment to `next_due_date + interval (based on frequency)` — mirrors pattern used in recurring reminders
- Savings goal progress: `(current_balance / target_amount * 100)%` — shown as a progress bar on dashboard; LLM can answer "X weeks until goal" by dividing `(target - balance)` by weekly allowance amount
- Currency stored as ISO code (default `GBP`) on the `allowances` table — display-only, no conversion needed
- LLM tool `pay_allowance` called with `child_name = 'all'` should iterate over all configured allowances and create one transaction per child — reduces friction for weekly bulk payment

---

### 18. Bill & Subscription Tracker

**Problem:** Modern households carry a growing portfolio of monthly subscriptions (Netflix, Spotify, Amazon Prime, gym memberships) alongside irregular bills (council tax, car insurance renewal, TV licence). These are often forgotten until the charge appears on a bank statement — or worse, until a service is cancelled for non-payment. The bot's budget tracker (#1) handles spending categories but has no concept of upcoming payment obligations or renewal date alerts.

**Value:** Surfaces upcoming bill payments before they hit, preventing surprises. Tracks total monthly subscription spend (subscription creep is a real problem). Sends advance alerts for renewals where the family might want to cancel or renegotiate. A practical, high-frequency-value feature that most families would use daily if it were seamlessly integrated.

**Use cases:**
- "Add Netflix — £17.99/month, renews on the 14th" — registers subscription
- "Add car insurance — £420/year, renews 3rd September" — annual bill with advance alert
- "What bills are due this month?" — full payment calendar view
- "How much are we spending on subscriptions per month?" — total monthly commitment
- "Cancel the reminder for Disney+ — we cancelled it" — removes bill
- "Car insurance is up for renewal in 2 weeks — worth shopping around" — advance alert with LLM-generated nudge
- Weekly digest includes: "Bills due this week: Netflix (14th, £17.99), water bill (16th, £42)"

**Integration points:**
- Renewal alerts hook into existing daily digest cron — bills due within 7 days surface in the morning message
- Optional link to budget tracker (#1): bill payments can be automatically logged as expense entries on their due date
- New LLM tools: `add_bill`, `list_bills`, `get_bills_due`, `delete_bill`, `get_monthly_commitments`
- New DB tables: `bills` (id, family_id, name, amount decimal, currency, frequency enum('weekly','monthly','quarterly','annual','one-off'), next_due_date, category, notes, active bool, created_at)
- Dashboard widget: bills calendar — a month view showing each bill's due date with amount; total monthly commitment summary at the top

**Implementation notes for next agent:**
- `next_due_date` advances automatically: cron job or on-query calculation rolls forward `next_due_date` by the frequency interval each time the date passes — no manual update needed
- Alert tiers: 30-day alert for annual bills (>£100), 7-day alert for all bills — included in digest rather than sent as a separate message to avoid notification fatigue
- Monthly commitment calculation: sum all active bills normalised to a monthly figure — annual bills divided by 12, weekly bills multiplied by 4.33; LLM tool returns this as a single figure
- `category` field (subscription, utility, insurance, tax, other) enables filtering and pairs with budget tracker categories for consistent labelling
- Duplicate detection: when adding a bill, query for existing bills with a similar name (fuzzy match) and warn if a potential duplicate is found

---

### 19. Family Time Capsule

**Problem:** Families often want to capture moments, wishes, and messages to be revisited in the future — a letter to a child on their 18th birthday, a New Year's resolution to be re-read in December, a message from the whole family to be opened on a 10th anniversary. There is no low-friction way to schedule such messages. Standard reminder apps can schedule a notification but cannot preserve a heartfelt message for delivery years away.

**Value:** A deeply personal, emotionally resonant feature that is uniquely suited to a Telegram-native AI assistant. No competing family app does this well. High perceived value from minimal technical investment. Creates a lasting reason for families to keep the bot installed and active — even years later when a capsule is finally "opened".

**Use cases:**
- "Save a time capsule: open on Maya's 18th birthday — [heartfelt message from the family]" — schedules a future Telegram message
- "Record our family wishes for 2026 — open on 31st December 2026" — New Year capsule
- "What time capsules do we have scheduled?" — lists pending capsules with open dates
- "Add a photo to the time capsule for Jake's 18th" — attaches a Telegram file_id to a capsule
- On the open date, the bot sends the capsule contents to the family chat with a special intro: "🎉 A message from your past selves, sealed [date]..."

**Integration points:**
- Delivery uses the existing Telegram bot DM or group chat mechanism — no new delivery infrastructure needed
- Cron job (`/cron/daily`) checks for capsules due today and dispatches them — same pattern as existing reminders
- New LLM tools: `create_capsule`, `list_capsules`, `add_to_capsule`, `delete_capsule`
- New DB tables: `time_capsules` (id, family_id, title, message text, open_date date, created_by, created_at, delivered_at), `capsule_attachments` (id, capsule_id, telegram_file_id, file_type, caption)
- Dashboard widget: "Sealed until…" capsule list showing titles and open dates (message content hidden until open date)

**Implementation notes for next agent:**
- `delivered_at` is set when the cron dispatches the capsule — prevents duplicate delivery if cron runs multiple times on the same day; query `WHERE open_date <= today AND delivered_at IS NULL`
- Dashboard hides `message` content for undelivered capsules — show title and open date only; content revealed after `delivered_at` is set
- Delivery message formatting: prepend a preamble ("This message was sealed on [created_at] by [creator name]") then the message body — makes the reveal feel intentional and ceremonial
- `capsule_attachments` stores `telegram_file_id` — same pattern as Photo Memory Log (#3); Telegram hosts the file indefinitely via the file_id reference
- LLM tool `create_capsule` should accept natural language open dates ("Maya's 18th birthday", "New Year's Eve 2030") and resolve them via the LLM before storing as an ISO date — reuse existing date-parsing patterns from the calendar service
- Edge case: if a capsule open date falls on a day the cron doesn't run (e.g. server downtime), check for capsules due in the last 3 days on each cron run to catch missed deliveries

---

### 20. Family Fitness & Activity Challenge Tracker

**Problem:** Many families want to be more active together but lack a shared accountability system. Individual fitness apps are siloed — there is no way for the whole family to set a shared step challenge, track a couch-to-5K programme together, or celebrate when everyone hits their weekly exercise goal. The bot already has a mood and wellbeing check-in concept (#15) and a rewards system, but no physical activity dimension.

**Value:** Brings the family together around health in a low-pressure, gamified way. Directly extends the existing kid points/rewards system — children earn points for completing activity goals. Adds a social accountability layer that individual fitness apps lack. Aligns with a growing cultural interest in family wellness without requiring any wearable integrations (log manually to keep the MVP simple).

**Use cases:**
- "Start a family step challenge this week — goal: 50,000 steps each" — creates a family-wide challenge with individual targets
- "I walked 8,500 steps today" — logs an activity entry for the current user
- "Jake did his 20-minute run today" — parent logs activity for a child; optionally awards points
- "How's everyone doing on the step challenge?" — leaderboard view for the active challenge
- "We all hit our goal this week! 🎉" — bot announces completion and awards bonus points to finishers
- "Create a family challenge: 30 days of 10,000 steps" — longer challenge with daily tracking

**Integration points:**
- Challenge completion awards points via existing `kid_points` service — same `addKidPoints` function call
- Weekly digest includes active challenge progress: "Step challenge — Dad: 38k/50k, Mum: 44k/50k, Jake: 29k/50k — 3 days left"
- New LLM tools: `create_challenge`, `log_activity`, `get_challenge_progress`, `list_challenges`, `complete_challenge`
- New DB tables: `challenges` (id, family_id, title, description, challenge_type enum('steps','exercise_minutes','custom'), target_value int, target_unit, start_date, end_date, points_reward int, status enum('active','completed','cancelled')), `challenge_participants` (id, challenge_id, user_id, participant_name, target_value, current_value, completed bool), `activity_logs` (id, family_id, user_id, participant_name, challenge_id, value int, unit, note, logged_at)
- Dashboard widget: active challenge progress bars per participant, leaderboard ranking, days remaining

**Implementation notes for next agent:**
- `participant_name` in `challenge_participants` and `activity_logs` is free-text — matches the pattern used across `kid_points`, `homework`, and `allowances` for consistency; children who don't have a Telegram account are entered by name only
- Challenge types: `steps` and `exercise_minutes` have defined units; `custom` type allows a user-defined metric (e.g. "glasses of water", "pages read") stored as a free-text `target_unit`
- Progress update: `log_activity` increments `challenge_participants.current_value` and sets `completed = true` if `current_value >= target_value` — then triggers point award via `addKidPoints`
- Auto-completion detection: cron job at end of challenge `end_date` marks incomplete participants as `completed = false`, sends a summary message to the group chat; completed participants receive their `points_reward`
- Leaderboard calculation: `SELECT participant_name, current_value, target_value, (current_value::float / target_value * 100) as pct FROM challenge_participants WHERE challenge_id = ? ORDER BY pct DESC`

---

### 21. Emergency Information Hub

**Problem:** In a genuine emergency — a burst pipe, a medical incident, a house fire — families fumble for critical information scattered across scraps of paper, old emails, and individual memory. Where is the stopcock? What is the home alarm code? What is Grandma's GP number? Who is the family's NHS blood type? The bot's shared notes feature (#4) can store freeform text but provides no structured, instantly-retrievable emergency layer optimised for high-stress, low-time situations.

**Description:** A dedicated emergency quick-reference system that stores the family's critical safety and household information in a structured, instantly accessible format. Think of it as a digital laminated card behind the front door — but always in your pocket. The bot responds to natural-language panic queries like "where's the stopcock?" or "what's the home alarm code?" with immediate, zero-friction answers. Data is organised into categories: home utilities, emergency contacts, medical essentials, and evacuation details.

**Value:** Reduces dangerous fumbling during emergencies. Creates a shared household knowledge base so any adult family member can act decisively in a crisis. Particularly valuable when one parent is away and the other needs information normally held by the absent partner.

**Use cases:**
- "Add emergency info: stopcock is under the kitchen sink, red lever" — stores utility detail
- "Where do I turn the water off?" — instant retrieval with zero-latency
- "Add home alarm code: 1492 — disarm within 30 seconds of entry" — sensitive operational detail
- "What's the gas emergency number?" — stored contact retrieval
- "Add evacuation meeting point: end of the driveway by the lamp post" — fire safety detail
- "What medical info is saved for Jake?" — retrieves Jake's blood type, allergies, and GP number

**Integration points:**
- Extends the existing `notes` table concept (#4) but with a structured `category` enum and `is_emergency` flag for priority retrieval
- New LLM tools: `save_emergency_info`, `get_emergency_info`, `list_emergency_categories`, `delete_emergency_info`
- New DB table: `emergency_info` (id, family_id, category enum('utilities','contacts','medical','evacuation','access_codes','other'), label, value, notes, created_by, updated_at)
- Dashboard widget: Emergency tab with categorised accordion panels — visible at a glance without drilling into lists
- Sensitive fields (alarm codes, safe combinations) masked on dashboard by default, revealed on click with a confirmation prompt

**Implementation notes for next agent:**
- `category` enum drives the dashboard icon/colour system: utilities (wrench icon), medical (cross icon), evacuation (exit icon), access_codes (key icon)
- LLM intent detection: add emergency-info retrieval as a high-priority intent in `systemPrompt.js` so "where's the X" queries bypass normal tool-selection deliberation and resolve instantly
- Access codes stored encrypted at rest: use a simple `crypto.createCipheriv` AES-256 wrapper in a new `utils/encrypt.js` — key derived from `SUPABASE_SERVICE_KEY` hash; keep it simple for MVP
- Dashboard masking: fields in the `access_codes` category render as `••••••` by default with a "reveal" button that logs the reveal event — prevents shoulder-surfing
- Onboarding hook: when a new family is created, the bot proactively asks "Would you like to save some emergency information? I can store your stopcock location, alarm code, and key contacts." — drives adoption of an easily-missed feature

---

### 22. Local Services & Trusted Contacts Directory

**Problem:** Every household builds an informal mental rolodex of trusted local tradespeople, services, and contacts — the plumber who fixed the boiler last year, the babysitter the family trusts, the reliable taxi number, the neighbour who holds the spare key. This knowledge lives in individual phones, old text threads, or yellowing business cards. When the boiler breaks at 10pm, nobody can find the plumber's number. When a new family member joins, they have no access to this accumulated local knowledge.

**Description:** A family-shared directory of trusted local services and contacts. Entries include name, category, phone number, website, notes (e.g. "ask for Dave, not Gary"), an optional rating, and the date last used. The bot responds to queries like "who do we use for boiler repairs?" with a structured, actionable answer. New entries are added conversationally. The directory becomes the family's shared institutional memory for the household.

**Value:** Eliminates the "who do we use for X?" friction. Ensures both parents have equal access to household service contacts. Reduces time spent searching old WhatsApp threads for a number. Particularly valuable when one parent handles most household admin — the knowledge becomes shared rather than siloed.

**Use cases:**
- "Save a contact: Mike the plumber — 07700 900123 — very reliable, fixed boiler twice" — adds entry with notes
- "Who do we use for boiler repairs?" — retrieves plumber entries with number and notes
- "Rate Mike the plumber 5 stars after today's visit" — updates rating
- "Add babysitter: Sarah Jones, 07711 223344, available weekends, kids love her" — adds with availability note
- "List all our local service contacts" — full directory browse
- "When did we last use the electrician?" — surfaces `last_used_at` date

**Integration points:**
- Distinct from the shared notes feature (#4) — contacts have structured fields (phone, category, rating) that notes do not; enables filtering, rating, and recency sorting
- New LLM tools: `add_service_contact`, `find_service_contact`, `list_service_contacts`, `update_service_rating`, `delete_service_contact`
- New DB table: `service_contacts` (id, family_id, name, category, phone, website, notes, rating smallint, last_used_at, created_by, created_at)
- Dashboard widget: searchable directory panel with category filter chips (plumbers, electricians, childcare, medical, other) and star ratings displayed

**Implementation notes for next agent:**
- `category` is a free-text field — do not use a fixed enum — allow the LLM to normalise it to a sensible label at save time (e.g. "boiler repair" → "plumber") for consistent filtering without over-engineering
- `rating` is 1–5 stored as smallint; LLM tool `update_service_rating` accepts natural language ("5 stars", "really good", "not great") and maps to a numeric value
- `last_used_at` is updated when a user says "we used X today" — add a simple `log_service_use` tool that sets this field and optionally appends a note
- Dashboard search: client-side filter on the directory panel — no server-side search endpoint needed for MVP given the small dataset size
- Phone number formatting: store raw digits/text as provided; display formatting is cosmetic only — avoid normalisation that would break international numbers

---

### 23. Family Meeting Agenda & Minutes

**Problem:** Regular family check-ins — weekly dinners, Sunday meetings, end-of-month reviews — tend to be unstructured, repeat the same topics without resolution, and leave no record of what was decided. Important decisions (holiday dates agreed, a new household rule, a commitment made) evaporate within days. There is no lightweight way to maintain a family agenda, capture what was discussed, and track action items to completion.

**Description:** A structured family meeting system built into the bot. Before a meeting, any family member can add agenda items conversationally. During or after the meeting, minutes are captured as bullet points and action items are assigned to named people with optional due dates. Action items are tracked until closed and surface in the daily digest until completed. A running log of past meetings is searchable — "what did we decide about the holiday in March?" gets a real answer.

**Value:** Transforms informal family discussions into decisions with accountability. Creates an institutional memory for the household. Action items with named owners and due dates mean commitments are honoured rather than forgotten. The meeting log becomes genuinely useful over months and years.

**Use cases:**
- "Add to this Sunday's family meeting agenda: decide on summer holiday destination" — appends agenda item
- "What's on the agenda for Sunday?" — lists current items
- "Record minutes: we agreed to go to Cornwall in August, Mum to book accommodation by next Friday" — captures decision and action item
- "Mark Mum's Cornwall booking action as done" — closes action item
- "What actions are still open from last month's meetings?" — surfaces unresolved items
- Daily digest includes open action items assigned to the current user: "Reminder: book Cornwall accommodation (from family meeting, due Friday)"

**Integration points:**
- Action item due-date reminders hook directly into `/cron/daily` — same pattern as homework and chore reminders
- New LLM tools: `create_meeting`, `add_agenda_item`, `list_agenda`, `record_minutes`, `add_action_item`, `close_action_item`, `list_open_actions`, `get_meeting_history`
- New DB tables: `family_meetings` (id, family_id, title, scheduled_at, status enum('upcoming','done'), created_at), `agenda_items` (id, meeting_id, family_id, item_text, added_by, created_at), `meeting_minutes` (id, meeting_id, family_id, content text, recorded_by, recorded_at), `action_items` (id, meeting_id, family_id, description, assigned_to, due_date, completed_at, created_by, created_at)
- Dashboard widget: two-panel section — upcoming meeting agenda (editable) + open action items with assignee and due date, sorted by urgency

**Implementation notes for next agent:**
- A meeting does not need to be formally "created" before items are added — if no upcoming meeting exists when an agenda item is added, auto-create a meeting record scheduled for the next logical Sunday (or ask the user for the date)
- `action_items.assigned_to` is free-text matching the established pattern — no foreign key required
- Minutes content is stored as plain text (LLM-generated or freeform user input); do not attempt to parse structure from minutes — store verbatim and let the LLM answer questions about it via context
- Digest hook: query `action_items WHERE completed_at IS NULL AND due_date <= now() + interval '3 days'` — include in daily digest grouped by `assigned_to` so each family member sees their own open tasks
- `get_meeting_history` tool uses LLM-powered semantic search over `meeting_minutes.content` — pass the last N meetings' minutes as context and ask the LLM to find the relevant decision; simpler than embedding-based search for MVP given the small corpus

---

### 24. Guest & Visitor Planner

**Problem:** When guests are coming to stay — grandparents visiting for a week, a friend staying the weekend — there is a cluster of preparation tasks that fall entirely on the host family's mental load: is the guest room ready, do they have dietary requirements, what meals are planned, are there activities booked? This coordination currently happens ad-hoc, with important details (Grandma is lactose intolerant, pick-up from the station at 3pm) easily lost between conversations.

**Description:** A lightweight guest management system where the family can create a visit record for each incoming guest or group. The visit includes arrival/departure dates, the guest's name, their dietary requirements, notes on preferences, and a linked preparation checklist. The bot surfaces upcoming visits in digests, prompts prep tasks as the visit approaches, and keeps everything in one place so both parents are equally prepared.

**Value:** Reduces host-family anxiety and last-minute scrambling. Ensures both parents know who is arriving, when, and what they need. Dietary requirements and preferences are never forgotten mid-shop. The preparation checklist ensures the guest room is ready and the fridge is stocked. Particularly valuable for families who host regularly (grandparents, school-friend sleepovers, travelling relatives).

**Use cases:**
- "Add a visit: Grandma and Grandpa, arriving Friday 18th, leaving Monday 21st — Grandma is dairy-free" — creates visit record
- "Who is coming to stay next month?" — lists upcoming visits
- "Add to the Grandma visit: pick up from Birmingham New Street at 3:15pm" — appends note
- "Generate a prep checklist for Grandma's visit" — LLM produces contextual list (guest room, dairy-free meal plan, flowers)
- "What dietary requirements do we have for this weekend's guests?" — instant lookup
- Daily digest on the visit arrival day: "Grandma and Grandpa arrive today at 3:15pm from Birmingham New Street — dairy-free meals needed"

**Integration points:**
- Arrival/departure events auto-created in the existing `events` (calendar) table — no separate calendar logic required
- Meal planning prompt: when a visit is created, the bot suggests "Would you like to plan meals for the visit? I know Grandma is dairy-free" — links naturally to the existing meal planner
- New LLM tools: `create_visit`, `list_visits`, `add_visit_note`, `get_visit_details`, `generate_visit_checklist`, `delete_visit`
- New DB table: `visits` (id, family_id, guest_names, arrival_date, departure_date, dietary_requirements text, notes text, checklist_list_id int references lists, created_by, created_at)
- Dashboard widget: upcoming visits card with guest name, date range, dietary flags, and checklist completion percentage

**Implementation notes for next agent:**
- `checklist_list_id` FK references the existing `lists` table — prep checklist is stored as a standard named list and managed with all existing list tooling; no new list infrastructure needed
- `generate_visit_checklist` LLM tool builds the checklist prompt from visit data: "A guest named [names] is visiting from [arrival] to [departure]. Dietary requirements: [requirements]. Notes: [notes]. Generate a practical host preparation checklist." — then calls `addListItem` for each item
- Calendar events: `create_visit` should call `createEvent` from the existing `calendar.js` service for both arrival ("Grandma arrives") and departure ("Grandma leaves") dates — keeps the shared calendar accurate without duplication
- Dietary requirements stored as free-text for MVP — avoid a fixed enum (dairy-free, nut-free, vegan, etc.) since combinations are common and edge cases are infinite; let the LLM surface requirements in context
- Daily digest hook: in `/cron/daily`, query `visits WHERE arrival_date = today` and append a visit briefing to the morning message including guest names and any key notes

---

### 25. Home Inventory & Insurance Log

**Problem:** Most households have no structured record of their valuable possessions. When something is stolen, damaged, or needs replacing, families struggle to recall purchase dates, model numbers, and estimated values — the exact information insurance claims require. High-value items (electronics, jewellery, appliances, bikes) are bought and forgotten until they are needed for a claim. Serial numbers are buried in email receipts. When a policy renewal comes around, there is no easy way to check if cover is still adequate.

**Description:** A home inventory system where the family can log valuable possessions with photos (via Telegram), purchase date, estimated value, serial number, and the item's location in the home. The total insured value can be calculated on demand. Items can be tagged by room (kitchen, garage, loft) or category (electronics, jewellery, bikes, appliances). The bot surfaces items when relevant — "we're renewing home insurance, here's a summary of high-value items" — and reminds the family to update the inventory when new purchases are logged.

**Value:** Dramatically simplifies insurance claims by maintaining an always-current possession record with photos and serial numbers. Helps families check their insurance coverage is adequate at renewal time. Provides peace of mind and removes a significant post-burglary or post-fire admin burden. Unique to a family-shared AI assistant — no mainstream insurance app is this conversational.

**Use cases:**
- "Add to home inventory: Sony 65-inch TV, bought January 2023, approx £1,200, serial WA123456, living room" — logs item
- "Add a photo of the TV receipt" — attaches Telegram file_id to the item record
- "What's the total value of our home inventory?" — sum of all item values
- "List all electronics over £500" — filtered view for insurance review
- "The bike was stolen — what serial number do we have on record?" — police report detail retrieval
- "We're renewing contents insurance — give me a summary of high-value items" — formatted list with values for the insurer

**Integration points:**
- Photo attachments use Telegram `file_id` — same pattern as Photo Memory Log (#3) and Time Capsule (#19); no external storage needed
- New LLM tools: `add_inventory_item`, `list_inventory`, `get_inventory_item`, `update_inventory_item`, `delete_inventory_item`, `get_inventory_summary`
- New DB table: `inventory_items` (id, family_id, name, category, location_in_home, purchase_date, purchase_value decimal, current_value decimal, serial_number, notes, telegram_file_ids text[], created_by, updated_at)
- Dashboard widget: inventory table with category filter, room filter, and a summary row showing total value; sortable by value; red flag if no photo is attached to high-value items

**Implementation notes for next agent:**
- `telegram_file_ids` stored as a text array to support multiple photos per item (receipt + photo of item + photo of serial number label) — same JSONB/array pattern as used elsewhere in the schema
- `current_value` is optional — defaults to `purchase_value` if not set; enables depreciation tracking in future but is not required for MVP
- `get_inventory_summary` tool returns: total count, total value, breakdown by category, items with no serial number recorded, items with no photo — gives actionable audit output
- Insurance renewal prompt: add to `/cron/weekly` a check for items added or updated in the last month — include a note "Your home inventory was updated recently — worth reviewing your contents insurance cover"
- High-value threshold for dashboard flag: items with `purchase_value > 500` that have no `telegram_file_ids` get an amber warning icon prompting the user to add a photo — proactive data quality nudge

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
| Bill & Subscription Tracker (#18) | Low | High | 16 — high daily relevance, zero external dependencies |
| Pocket Money Manager (#17) | Low | High | 17 — extends existing points system, prevents family disputes |
| Travel & Holiday Planner (#16) | Medium | High | 18 — complements countdowns and lists, strong seasonal use |
| Fitness Challenge Tracker (#20) | Medium | Medium | 19 — gamified wellness, extends rewards system |
| Family Time Capsule (#19) | Low | High | 20 — emotionally unique, low build cost, long-term retention driver |
| Emergency Info Hub (#21) | Low | High | 21 — zero tables overhead, high safety value, fast to build |
| Local Services Directory (#22) | Low | Medium | 22 — replaces household rolodex, low complexity |
| Family Meeting Planner (#23) | Medium | Medium | 23 — adds accountability layer, pairs with action item digests |
| Guest & Visitor Planner (#24) | Low | Medium | 24 — targeted use case, reuses lists and calendar |
| Home Inventory (#25) | Medium | High | 25 — strong insurance value prop, photo attachments add delight |
| Rewards Store (#26) | Low | High | 26 — completes the points loop, high engagement for kids |
| Book Club & Reading Log (#27) | Low | High | 27 — natural companion to watchlist, extends kid rewards |
| Screen Time Budget Manager (#28) | Medium | High | 28 — high parent demand, extends watchlist and points system |
| Digest & Notification Preferences (#29) | Low | Medium | 29 — essential housekeeping as feature count grows |
| Date Night Planner (#30) | Low | Medium | 30 — balances the kid-heavy feature set with parent-focused utility |

---

## New Feature Ideas (Batch 2 — Generated 2026-04-04)

---

### 26. Family Rewards Store

**Problem:** The existing kid points system tracks earned points and displays milestones (every 20 points = 1 "Mickey Head"), but has no mechanism for actually spending those points. Points accumulate with no clear redemption path, reducing the motivational pull over time. There is nothing for a child to work *towards* — no goal to save up for, no tangible reward to unlock.

**Description:** A parent-managed rewards catalogue where each entry has a name, a point cost, and an optional stock limit or cooldown period. Children can browse available rewards via the bot or dashboard and "purchase" one by spending their accumulated points. The transaction deducts points from their balance and logs the redemption in the existing `point_history` table. Parents receive a Telegram notification when a child redeems a reward, so they can honour it in real life.

**Value:** Completes the motivational loop of the points system. Children gain agency — they choose what to save and spend towards. Parents get a structured, agreed reward menu instead of ad-hoc negotiations. Transforms points from an abstract score into a genuine currency with real-world consequences. Expected to significantly increase daily engagement with chores, homework, and any other points-earning features.

**Use cases:**
- "Add a reward: extra 30 minutes screen time — 10 points" — parent creates a reward item
- "What rewards can I get with my points?" — child browses the catalogue with current balance
- "Jake wants to redeem: trip to the cinema — 50 points" — redemption triggers point deduction and parent notification
- "List all redeemed rewards this month" — parent reviews what has been claimed
- "Set the cinema reward to once per month" — parent adds a cooldown to prevent immediate re-purchase
- Dashboard shows each child's balance alongside available rewards and progress towards the next one

**Integration points:**
- Directly extends the existing `kid_points` and `point_history` tables — redemption is a debit entry in `point_history` with `type = 'redeem'`
- Parent notification on redemption uses the existing Telegram bot DM mechanism
- New LLM tools: `add_reward`, `list_rewards`, `redeem_reward`, `delete_reward`, `list_redemptions`
- New DB tables: `rewards` (id, family_id, name, description, point_cost int, cooldown_days int, max_per_child int, active bool, created_by, created_at), `reward_redemptions` (id, reward_id, family_id, child_name, redeemed_at, points_spent, notified bool)
- Dashboard widget: per-child balance card updated to include a "Rewards" tab showing the catalogue and a progress bar towards the child's next affordable reward

**Implementation notes for next agent:**
- `redeem_reward` must check `current_balance >= reward.point_cost` before deducting — return a friendly error if insufficient points ("Jake needs 12 more points for this reward")
- Cooldown enforcement: query `reward_redemptions WHERE reward_id = ? AND child_name = ? AND redeemed_at > now() - interval '{cooldown_days} days'` before allowing a repeat redemption
- `point_history` entry for a redemption: `change = -point_cost`, `reason = 'Redeemed: [reward name]'` — reuses existing audit log pattern exactly
- Parent notification message: "🎁 Jake just redeemed **Trip to the cinema** (50 pts). His new balance is 12 pts." — sent to the family group chat or the creating parent's DM
- Dashboard progress bar: `(current_balance / next_affordable_reward.point_cost * 100)%` — show the cheapest reward the child cannot yet afford as the motivational target

---

### 27. Book Club & Family Reading Log

**Problem:** The bot already has a watchlist for films and TV shows, but there is no equivalent for books. Families — especially those with school-age children — accumulate reading lists, book recommendations, and "should read" titles across sticky notes, Goodreads profiles, and school newsletters. There is no shared family record of what everyone is reading, has read, or wants to read next. For children, there is no connection between reading activity and the rewards system.

**Description:** A shared family reading log modelled closely on the existing watchlist. Each entry has a title, author, reader (which family member it belongs to), reading status (want to read, reading, finished), an optional rating, and notes. Children can log books they finish and earn configurable points, creating a direct link between reading habits and the rewards system. Parents can recommend books, track a child's reading progress through the school year, and build a shared family library of loved titles.

**Value:** Encourages a reading culture with a light gamification layer that fits naturally with the existing points system. Gives parents visibility into children's reading without friction. Provides a shared family record of great reads to revisit and recommend. Directly extends the value of an existing, proven feature (watchlist) with minimal new infrastructure.

**Use cases:**
- "Add The BFG to Sam's reading list" — adds a want-to-read entry for a child
- "Sam finished The BFG — 4 stars, brilliant!" — marks as read, awards points, stores rating
- "What books has Robyn read this year?" — filtered reading history per child
- "Recommend me a book similar to The BFG" — LLM uses reading history as context for a recommendation
- "What's on our family reading list?" — full catalogue view across all family members
- "Add to my reading list: Atomic Habits" — parent manages their own adult reading list
- Weekly digest includes: "Reading this week — Sam: The BFG (in progress), Robyn: Matilda (finished ⭐⭐⭐⭐⭐)"

**Integration points:**
- Schema and service mirror the existing `watchlist` table almost exactly — accelerates build significantly
- Book completion can call `addKidPoints(familyId, childName, points, reason)` from the existing `services/points.js` — configurable points per book finished
- New LLM tools: `add_book`, `update_book_status`, `list_books`, `get_reading_history`, `delete_book`
- New DB table: `books` (id, family_id, reader_name, title, author, status enum('want_to_read','reading','finished'), rating smallint, notes, finished_at, points_awarded bool, created_at) — mirrors `watchlist` schema closely
- Dashboard widget: reading log tab per family member with status filters and a "Books finished this year" count; for children, show points earned from reading

**Implementation notes for next agent:**
- `reader_name` is free-text matching the pattern used in `kid_points`, `homework`, and `allowances` — no foreign key, consistent with all other child-referencing features
- `update_book_status` to `finished` should: set `finished_at = now()`, optionally call `addKidPoints` (if `reader_name` matches a known child and points are enabled), set `points_awarded = true` to prevent duplicate awards on re-status
- LLM recommendation: `get_book_recommendation` tool passes the reader's `finished` books as context and asks the LLM for a suggestion — no external book API needed for MVP; Llama 3.3 70B has sufficient knowledge
- Points configuration: store configurable points-per-book in a new `reading_settings` column on `families` table (default 5 points per finished book) — or a simple env variable for MVP
- Dashboard: reuse the watchlist widget component, parameterised by data type — minimal front-end duplication

---

### 28. Screen Time Budget Manager

**Problem:** Parents of young children consistently cite managing screen time as one of their top daily friction points. The bot already tracks shows on the watchlist and manages kid rewards, but has no concept of daily or weekly screen time limits. Currently, screen time negotiations are entirely ad-hoc: requests, arguments, and parent memory of how long the TV has been on. There is no shared, neutral record.

**Description:** A daily screen time budget system per child. Parents set a daily or weekly allowance (e.g. "Sam gets 2 hours of screen time on school days, 3 hours at weekends"). When screen time starts, a parent or child logs it ("Sam is watching TV now"). When it ends, the session is logged. The bot tracks consumed vs. remaining time and reports on it conversationally. Children can optionally earn bonus screen time by spending points from the rewards system — turning good behaviour into a screen time top-up.

**Value:** Removes the subjective, conflict-prone nature of screen time negotiations by creating a neutral shared record. Both parents can instantly check the state. Children accept bot-enforced limits more readily than parent-enforced ones. The points-for-screen-time mechanic creates a powerful motivational link between the rewards system and the most universally desired resource for young children. High-frequency, daily utility.

**Use cases:**
- "Set Sam's school day screen time to 90 minutes" — configures daily budget
- "Sam started watching TV at 4pm" — begins a session timer
- "Sam stopped watching at 4:45pm" — logs session, updates remaining allowance
- "How much screen time does Sam have left today?" — instant status check
- "Sam used his 10 points to earn an extra 30 minutes" — points-to-screen-time redemption
- "Screen time report for this week" — summary of daily usage across the week for all kids
- Daily digest: "Sam: 45 mins used, 45 mins remaining today"

**Integration points:**
- Points-for-screen-time redemption uses the existing `rewards` system (idea #26) — parent creates a "30 minutes extra screen time" reward with a point cost; redemption auto-increments the child's daily budget
- Session start/stop can optionally link to `watchlist` entries — "Sam started watching Moana" logs both a session and optionally marks the watchlist item as in-progress
- New LLM tools: `set_screen_time_budget`, `start_session`, `end_session`, `get_remaining_time`, `get_screen_time_report`, `add_bonus_time`
- New DB tables: `screen_time_budgets` (id, family_id, child_name, weekday_minutes int, weekend_minutes int, updated_at), `screen_time_sessions` (id, family_id, child_name, started_at, ended_at, duration_minutes, note, created_by), `screen_time_bonuses` (id, family_id, child_name, bonus_minutes, reason, granted_at, granted_by)
- Dashboard widget: per-child daily gauge showing used/remaining time with a colour gradient (green → amber → red as limit approaches); weekly bar chart of daily usage

**Implementation notes for next agent:**
- "Remaining today" calculation: `budget_minutes + SUM(bonuses today) - SUM(session durations today)` — always derived, never stored, to prevent drift
- Weekend detection: `EXTRACT(dow FROM now())` — 0 (Sunday) or 6 (Saturday) triggers `weekend_minutes` budget; otherwise `weekday_minutes`
- If `end_session` is called without a matching `start_session`, infer duration from a user-provided estimate or ask: "How long was Sam watching for?"
- Rollover policy: unused time does NOT roll over by default — this is intentional to prevent bank-and-binge behaviour; document this clearly in the LLM system prompt response for the feature
- Dashboard daily reset: sessions are date-partitioned; the gauge resets at midnight per the family's configured timezone — use the existing `utils/time.js` timezone handling

---

### 29. Digest & Notification Preferences

**Problem:** As the bot accumulates features, the daily and weekly digests grow longer and less relevant to each family member. A parent managing meal planning does not want their digest cluttered with pet care reminders. A teenager does not need the grocery list summary. Currently, all digest content is hardcoded and sent uniformly to all registered users with no per-user customisation. As more features are added (chores, homework, mood check-ins, screen time, pet care), digest fatigue will cause users to stop reading or disable the bot entirely.

**Description:** A per-user notification preference centre where each family member controls which digest sections they receive, what time they receive the daily message, and which types of proactive alerts are active for them. Preferences are set conversationally ("stop sending me the pet care reminders" or "send me the daily digest at 8:30am instead of 7am") or via a dashboard settings panel. The cron system reads preferences before building each user's digest, including only the sections relevant to them.

**Value:** Prevents notification fatigue as feature count grows. Increases the signal-to-noise ratio of each digest, making it more likely to be read. Directly improves retention — the most common reason users disable bots is irrelevant notification volume. Architecturally, this is foundational infrastructure that every future feature benefits from by being opt-in by default. Low build cost, high systemic value.

**Use cases:**
- "Stop sending me the pet reminders in my morning digest" — disables a section for this user
- "Send me the daily digest at 8:30am" — updates personal digest send time
- "What notifications am I currently getting?" — lists active digest sections and alert types
- "Turn off weekly digests for me — I only want daily" — disables a digest frequency
- "Enable check-in prompts for me at 7pm" — opts in to a new notification type
- New users default to a sensible minimal set; power users can enable everything; parents with young children get kid-focused sections by default

**Integration points:**
- `cron.js` daily and weekly digest builders query `notification_preferences` for each user before assembling the digest — include only sections where `enabled = true`
- Each future feature registers its digest section identifier at build time — the preferences system is the single source of truth for what gets sent
- New LLM tools: `set_notification_pref`, `get_notification_prefs`, `list_notification_sections`
- New DB table: `notification_preferences` (id, user_id, family_id, section_key varchar, enabled bool, send_time time, updated_at) — `section_key` is a string like `daily_digest`, `weekly_digest`, `pet_care`, `homework_reminders`, `screen_time_daily`, `checkin_prompts`, `chore_reminders`
- Dashboard widget: notification settings panel with toggle switches per section, a time-picker for digest delivery time, and a preview of what the current digest would contain

**Implementation notes for next agent:**
- Default preferences: on `users` creation, seed a row per known `section_key` with `enabled = true` — opt-out model preserves existing behaviour for current users; new opt-in features (mood check-ins, screen time) default to `enabled = false`
- `send_time` stored as `time` (PostgreSQL time type, timezone-aware via the existing `utils/time.js`) — each user's digest is dispatched at their configured time rather than a family-wide time
- Cron refactor: the `/cron/daily` handler should iterate users and build a personalised digest per user rather than one family-wide message — this is the key architectural change; use a helper `buildDigest(userId, familyId, sections[])` function
- Section registration pattern: define a `DIGEST_SECTIONS` constant object in a new `utils/digestSections.js` mapping `section_key` to a label and a builder function — new features add one entry to this object to become automatically configurable
- LLM intent: "stop sending me X" should resolve `section_key` via the LLM (e.g. "pet reminders" → `pet_care`) and call `set_notification_pref(section_key, false)` — add a normalisation mapping in `systemPrompt.js`

---

### 30. Date Night Planner & Parent Zone

**Problem:** The bot is comprehensively built around family and children — kid rewards, homework, school activities, mood check-ins — but has almost no features aimed at the parents as a couple. Coordinating adult plans (date nights, anniversary dinners, adult-only weekends away) involves the same fragmented friction as family planning, but parents are less likely to use a child-focused tool for their own relationship. There is also no structure for tracking babysitter availability, restaurant experiences, or couple-specific wish lists.

**Description:** A lightweight adults-only planning layer within the existing bot. Parents can log date nights, rate restaurants they visit together, maintain a "places to go" bucket list, and track their anniversary and relationship milestones. The bot proactively suggests date ideas when it detects a quiet week on the family calendar. Babysitter availability (from the local services directory, idea #22) is surfaced when planning an evening out. Anniversaries and relationship milestones get dedicated proactive reminders — the bot should be as invested in the parents' relationship as it is in the kids' achievements.

**Value:** Rounds out the product's emotional appeal for both parents rather than only serving them as coordinators of children's lives. Increases adult engagement and retention — parents are more likely to keep using a bot that also cares about *them*. Requires no new infrastructure beyond a small schema addition and sits naturally alongside the existing birthdays and calendar features. Sends a product signal that this is a family assistant, not just a children's management tool.

**Use cases:**
- "Plan a date night for Friday — Italian restaurant in town" — creates a calendar event tagged as date night, adds to restaurant wish list
- "We tried Carluccio's last night — 4 stars, lovely pasta" — logs a restaurant visit with rating and notes
- "Where should we go for our anniversary dinner?" — LLM suggests from the rated restaurant list or generates ideas based on location
- "Remind me 2 weeks before our anniversary to book something special" — advance reminder tied to anniversary date
- "What date nights have we had this year?" — logs a personal couple activity history
- "Suggest a date idea for next week" — LLM checks the family calendar for a quiet evening and suggests an activity

**Integration points:**
- Date night events created in the existing `events` (calendar) table with a `tag = 'date_night'` metadata field — no new calendar infrastructure
- Anniversary reminders use the existing `reminders` service with a `recurrence = 'annual'` flag — same as birthday reminders
- Restaurant wish list stored in the existing `lists`/`list_items` tables with a named list "Date Night Restaurants" — zero new tables for this part
- New LLM tools: `log_restaurant_visit`, `get_restaurant_history`, `suggest_date_idea`, `set_anniversary`, `get_anniversary`
- New DB table: `restaurant_visits` (id, family_id, name, cuisine, location, visited_at, rating smallint, notes, created_by) — lightweight venue log; separate from the local services directory which is for tradespeople
- Dashboard widget: "Parent Zone" section — upcoming date nights from the calendar, next anniversary countdown, top-rated restaurants, and a date idea suggestion button

**Implementation notes for next agent:**
- `set_anniversary` stores the date in the existing `birthdays` table with `name = 'Anniversary'` and a `is_anniversary = true` flag (add this column) — reuses all birthday reminder infrastructure without duplication
- Date idea suggestion: the `suggest_date_idea` LLM tool queries the family calendar for evenings with no events in the next 14 days, picks the most suitable one, and asks the LLM to suggest an activity — pass `restaurant_visits` top-rated entries as context so suggestions feel personalised
- Restaurant list is separate from the local services directory (#22) intentionally — restaurants are for couple experiences (rated, atmospheric, occasion-based) while the services directory is for tradespeople (reliable, practical, transactional); different UX needs
- "Date Night" tag on calendar events: add a `tags text[]` column to the `events` table if not present, or use the `notes` field with a prefix convention (`[date-night]`) for MVP — avoids a schema migration for a cosmetic feature
- Privacy model: "Parent Zone" dashboard section is collapsed by default and requires a click to expand — subtle gesture that this is adult content in a family-shared interface; no technical access control needed for MVP
