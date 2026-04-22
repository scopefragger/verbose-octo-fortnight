# Family Assistant — Project Intelligence

> **Self-healing file.** When you answer a question about architecture, patterns, or design flows
> that is not documented here, update the relevant section before finishing your response.
> Keep additions to 1–3 sentences. This file is the single source of truth for "how we do things."

---

## Project Overview

A family assistant with four surfaces: **Telegram bot** (natural language), **TV dashboard** (HTML),
**Ideas Lab** (feature pipeline), and a **REST API** that ties them together.

- **Runtime:** Node.js (ESM), Express.js
- **Database:** Supabase (PostgreSQL). RLS is defined but currently disabled — all auth is done in
  application code.
- **Bot:** Grammy framework, polling locally, webhook in production (controlled by `WEBHOOK_URL` env var)
- **LLM:** Groq `llama-3.3-70b-versatile` via `/llm/groq.js`
- **Deploy:** Render.com reads the `main` branch. Changes must be pushed to `main` to deploy.
- **Repo:** `scopefragger/verbose-octo-fortnight`

---

## PRE-IMPLEMENTATION VALIDATOR PROTOCOL — MANDATORY

> **THIS IS NOT OPTIONAL.** Before writing, editing, or deleting ANY code for a new feature or
> significant change, you MUST run the validator panel and incorporate their agreed plan.
> No exceptions. The validators run as Haiku sub-agents inside Claude Code.

### What It Does

Expert AI personas independently review the task, then discuss each other's findings, then a
synthesis agent produces a final agreed design plan. This catches security gaps, UX problems,
architecture issues, and misunderstood requirements *before* any code is committed.

The personas are defined in `validators/personas/`. Five are the **standing panel** (included when their domain is touched). Two are **on-demand specialists** (spawned only when tasks specifically require their expertise):

| File | Persona | Role | Type |
|---|---|---|---|
| `cecile.md` | Cecile | BISO — security, threat modeling, data protection | Standing |
| `enriqua.md` | Enriqua | Senior UX Expert — mobile, conversational, end-user flows | Standing |
| `mike.md` | Mike | Staff Engineer — system design, scalability, architecture | Standing |
| `bob.md` | Bob | Director of Product — customer need, scope, real-family value | Standing |
| `dan.md` | Dan | Senior Data Engineer — schema design, migrations, data patterns | Standing |
| `ops.md` | Jordan | Operations/DevOps Engineer — cron reliability, perf, observability | On-demand |
| `integration.md` | Priya | Integration/API Engineer — external services, retries, webhooks | On-demand |

**On-demand triage rules:**
- Include **Jordan** when the task adds a cron job, bulk data operation, or an endpoint expected to sustain significant traffic.
- Include **Priya** when the task integrates a brand-new external service, adds a webhook handler, or makes meaningful changes to retry/timeout logic for Groq, GitHub, Telegram, or Supabase.

### When to Run

Run the validator for:
- Any new feature (new route, service, bot tool, migration, or frontend capability)
- Any change touching authentication, data schema, or the LLM system prompt
- Any task where requirements are ambiguous or cross multiple domains

Do NOT run for:
- Pure bug fixes where correct behaviour is unambiguous
- Documentation-only changes
- Trivial one-liner tweaks (e.g. fixing a typo in a string)

### How to Run

Use the `/validate` skill:

```
/validate <task description>
```

The skill reads all five persona files, runs independent reviews, loops the discussion until all
personas reach resolution (not a fixed number of rounds), then runs synthesis — and presents the
Final Agreed Plan with any STOP/WAIT flags automatically.

#### Protocol detail (reference)

**Round 1 — Independent reviews (parallel).** 5 Haiku agents spawned simultaneously, each
receiving their full persona prompt + the task description. Each returns a <300-word review and
a GO / CONDITIONAL GO / STOP verdict.

**Discussion loop (parallel, repeating).** All 5 personas are re-spawned in parallel, each
receiving their persona prompt, the task, and the full accumulated discussion history so far.
Each may raise new concerns, respond to peer input, or state "No further concerns from [role]
perspective." The loop continues until ALL five personas have declared no further concerns.

**Synthesis (single agent).** One neutral facilitator Haiku agent receives all rounds' outputs
and produces: (1) top 3 cross-cutting concerns, (2) concrete recommended implementation
approach, (3) STOP/WAIT flags.

### What to Do with the Output

1. Present the **FINAL AGREED PLAN** to the user.
2. If there are STOP/WAIT flags, surface them to the user and wait for resolution before coding.
3. Use the top concerns to shape your implementation approach.
4. Do not skip or abbreviate the protocol — the Haiku model is fast and cheap.

---

## Repository Layout

```
index.js              — Express server, all API routes (~800 lines, monolithic by design)
bot/
  bot.js              — Grammy bot setup, command registration
  messageHandler.js   — LLM chat loop with tool calling
  commands.js         — /start, /link, /join, /help handlers
llm/
  groq.js             — chatCompletion() wrapper
  functions.js        — Tool definitions + dispatch()
  systemPrompt.js     — buildSystemPrompt()
  summarise.js        — Conversation summarisation
services/             — One file per domain (meals, events, reminders, etc.)
routes/
  auth.js             — Login/logout/refresh endpoints + Supabase Auth
  cron.js             — checkReminders(), sendDailyDigest(), sendWeeklyDigest()
  dashboard.js        — getDashboardData() (aggregates everything for the TV)
middleware/
  auth.js             — requireAuth, requireCronSecret
db/
  supabase.js         — supabase (service key) + supabaseAuth (anon key) clients
  migrations/         — Numbered SQL files (001–025). Run manually in Supabase SQL Editor.
public/
  dashboard.html      — TV dashboard (standalone, all CSS+JS inline)
  ideas.html          — Ideas Lab (standalone)
  mtg-commander.html  — MTG Commander tool
  house-builder.html  — House builder tool
utils/
  cache.js            — registerInvalidator(), invalidateCache()
  errorLog.js         — logError(), getErrors(), clearErrors()
```

---

## Authentication Pattern

All API endpoints use `requireAuth` middleware. It accepts **either**:

1. `?secret=CRON_SECRET` — shared secret, for crons, dashboard, and direct API access
2. `sb_access_token` cookie — Supabase Auth session cookie set at login

Cron-only endpoints use `requireCronSecret` (secret only, no cookie fallback).

The `supabase` client (service key) bypasses RLS. The `supabaseAuth` client (anon key) is used for
verifying user sessions via `supabaseAuth.auth.getUser(token)`.

---

## API Route Pattern

Every route in `index.js` follows this shape:

```js
app.METHOD('/api/path', requireAuth, async (req, res) => {
  try {
    const familyId = await getFamilyId();
    if (!familyId) return res.status(404).json({ error: 'No family found' });
    // validate required fields before calling service
    const result = await someService(familyId, req.body);
    invalidateCache();           // only on mutations
    res.json(result);
  } catch (err) {
    logError('Context label', err);
    res.status(500).json({ error: err.message });
  }
});
```

Always validate required fields before calling services. Always call `invalidateCache()` after
mutations so the dashboard reflects changes immediately.

---

## Service Layer Pattern

Services live in `/services/*.js`. Each function takes `familyId` as its first argument and
interacts with Supabase directly. Services never touch `req`/`res`.

```js
export async function createThing(familyId, { field1, field2 }) {
  const { data, error } = await supabase
    .from('things')
    .insert({ family_id: familyId, field1, field2 })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

Delete operations must always scope by both `id` AND `family_id` to prevent cross-family data access.

---

## Database / Migration Pattern

- Migrations are plain SQL files in `db/migrations/`, numbered sequentially (`001_...sql`).
- Run manually in the **Supabase SQL Editor** — there is no automated migration runner.
- Every table that belongs to a family must have a `family_id UUID REFERENCES families(id) ON DELETE CASCADE`.
- New columns use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

Current highest migration: **025** (`025_family_link_code.sql`)

---

## Frontend Pattern

All frontend is vanilla JS in standalone HTML files — no build step, no framework.

**XSS prevention:** Always wrap user-supplied data in `esc()` before interpolating into HTML strings.
This applies to `onclick` attributes too — IDs passed as JS string arguments must be `esc()`-wrapped.

**API calls:** Use `fetch('/api/...')` with credentials. The secret is embedded in the page via a
server-side template variable or passed as a query param (known security debt — tracked).

**`target="_blank"` links** must always have `rel="noopener noreferrer"`.

**HTML files are pre-read at startup** in `index.js` into the `HTML` object — do not use
`fs.readFileSync` inside route handlers.

---

## Bot / LLM Pattern

The bot uses a **multi-round tool-calling loop** (max 5 rounds) in `bot/messageHandler.js`.
Conversation history is loaded with smart summarisation: the most recent 8 messages are kept verbatim,
older messages are summarised and prepended as a system message.

`JSON.parse(toolCall.function.arguments)` is always wrapped in try/catch. If parsing fails, a tool
error response is pushed and the loop continues (no crash).

Tool definitions live in `llm/functions.js`. Adding a new bot capability = add a tool definition
there and add a case to `dispatch()`.

---

## Ideas Lab / Theorize Pipeline

Ideas go through a **12-pass LLM pipeline**:
- Passes 1–7: analysis (problem, solution, risks, tech, UX, effort, competitors)
- Passes 8–11: persona tests (wife/mum, husband/dad, 8yo girl, 6yo boy)
- Pass 12: synthesis

`theorizeIdea(ideaId)` runs all 12 passes sequentially, saving each to `idea_theories`.
`retheorizeIdea(ideaId, adjustments)` re-runs with user notes prepended to the idea description.
`suggestImprovements(ideaId)` asks the LLM for 5–8 enhancement ideas based on all theories.
`executeHandoff(ideaId)` compiles theories into a prompt and commits it to `ideas/que/<slug>.md`
on the main branch via the GitHub API (no Claude API needed).

---

## Dashboard Cache

`getDashboardData()` in `routes/dashboard.js` aggregates all family data. The result is cached
in memory for 5 minutes. Call `invalidateCache()` after any mutation to write-invalidate it.
The cache falls back to stale data on errors rather than returning a 500.

---

## Git / Deploy Workflow

Claude Code works in **git worktrees** (branch `claude/<name>`). To deploy, push the worktree
branch directly to `main`:

```bash
git push origin claude/<branch-name>:main
```

If the remote has new commits, rebase first:

```bash
git fetch origin main && git rebase origin/main && git push origin HEAD:main
```

Never `git checkout main` inside a worktree — `main` is already checked out by the parent repo.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Random string for webhook verification |
| `WEBHOOK_URL` | Set to enable webhook mode (leave empty for local polling) |
| `GROQ_API_KEY` | From console.groq.com |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | service_role key (bypasses RLS) |
| `SUPABASE_ANON_KEY` | anon/public key (for Supabase Auth) |
| `CRON_SECRET` | Shared secret for cron + dashboard API access |
| `GITHUB_TOKEN` | Personal access token with Contents + PRs write scope |
| `PORT` | Defaults to 3000 |
| `NODE_ENV` | `production` on Render, `development` locally |

---

## Known Debt & Constraints

- **RLS is disabled** — all family scoping is enforced in application code, not the database.
- **Single-family app** — `getFamilyId()` always returns the first family. Multi-tenancy is not
  implemented; adding it requires replacing all `getFamilyId()` calls with auth-aware lookups.
- **`index.js` is monolithic** — ~800 lines of routes, intentionally not split yet.
- **No automated migration runner** — migrations are applied manually in Supabase SQL Editor.
- **Secret in URL** — dashboard passes `?secret=` as a query param; visible in server logs.
- **No rate limiting** — the Telegram bot has no per-user rate limiting on LLM calls.

---

## Adding a New Feature — Checklist

1. **Migration** — add `db/migrations/0XX_name.sql` if schema changes needed
2. **Service** — add `services/name.js` with functions scoped by `familyId`
3. **Route** — add endpoint in `index.js` following the standard route pattern
4. **Bot tool** (optional) — add tool definition + dispatch case in `llm/functions.js`
5. **Frontend** (optional) — update the relevant `.html` file; use `esc()` everywhere
6. **Cache** — call `invalidateCache()` after mutations that the dashboard should reflect
7. **Deploy** — `git push origin <worktree-branch>:main`
