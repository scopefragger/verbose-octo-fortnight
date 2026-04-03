import { supabase } from '../db/supabase.js';
import { chatCompletion } from '../llm/groq.js';

const REPO = 'scopefragger/verbose-octo-fortnight';

// Fetch project context from GitHub to give the LLM real codebase awareness
let _projectContext = null;
let _contextFetchedAt = 0;
const CONTEXT_TTL = 60 * 60 * 1000; // 1 hour cache

async function getProjectContext() {
  if (_projectContext && Date.now() - _contextFetchedAt < CONTEXT_TTL) return _projectContext;

  try {
    // Fetch key files in parallel for project understanding
    const [pkgRes, indexRes, servicesRes, migrationsRes, ideasMdRes] = await Promise.all([
      fetch(`https://raw.githubusercontent.com/${REPO}/main/package.json`),
      fetch(`https://api.github.com/repos/${REPO}/contents/services`),
      fetch(`https://api.github.com/repos/${REPO}/contents/db/migrations`),
      fetch(`https://api.github.com/repos/${REPO}/contents/llm`),
      fetch(`https://raw.githubusercontent.com/${REPO}/main/PRODUCT_IDEAS.MD`),
    ]);

    const pkg = await pkgRes.json().catch(() => ({}));
    const services = await servicesRes.json().catch(() => []);
    const migrations = await migrationsRes.json().catch(() => []);
    const llmFiles = await indexRes.json().catch(() => []);
    const productIdeas = await ideasMdRes.text().catch(() => '');

    const serviceNames = Array.isArray(services) ? services.map(f => f.name).join(', ') : 'unknown';
    const migrationNames = Array.isArray(migrations) ? migrations.map(f => f.name).join(', ') : 'unknown';
    const llmFileNames = Array.isArray(llmFiles) ? llmFiles.map(f => f.name).join(', ') : 'unknown';
    const deps = Object.keys(pkg.dependencies || {}).join(', ');

    _projectContext = `
PROJECT CONTEXT (from GitHub repo ${REPO}):
Tech Stack: Node.js/Express, Supabase (PostgreSQL), Grammy (Telegram bot), Groq LLM (llama-3.3-70b), single-page dashboard HTML
Dependencies: ${deps}
Services: ${serviceNames}
DB Migrations: ${migrationNames}
LLM modules: ${llmFileNames}
${productIdeas ? `\nExisting Product Ideas:\n${productIdeas.substring(0, 1500)}` : ''}

The app is a family assistant with: Telegram bot (natural language), TV dashboard, meal planner, calendar, reminders, points system, watchlist, birthdays, food expiry tracker, countdown timers, and an ideas queue.
API uses Express with secret-based auth. Dashboard is a single HTML file with inline CSS/JS. All data is per-family via family_id FK.
`.trim();

    _contextFetchedAt = Date.now();
  } catch (err) {
    console.error('Failed to fetch project context:', err.message);
    _projectContext = 'PROJECT: Family assistant app with Telegram bot, TV dashboard, Supabase DB, Groq LLM. Features: meals, calendar, reminders, points, watchlist, birthdays, food expiry, countdowns, ideas.';
    _contextFetchedAt = Date.now();
  }

  return _projectContext;
}

export async function getIdeas(familyId) {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addIdea(familyId, { title, description, category }, userId) {
  const { data, error } = await supabase
    .from('ideas')
    .insert({
      family_id: familyId,
      title,
      description: description || null,
      category: category || null,
      added_by: userId || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIdea(ideaId, familyId) {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', ideaId)
    .eq('family_id', familyId);
  if (error) throw error;
  return { deleted: true };
}

export async function processIdeaQueue(familyId) {
  // Fetch pending ideas (batch of 5)
  const { data: pending, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at')
    .limit(5);

  if (error) throw error;
  if (!pending || pending.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const idea of pending) {
    // Mark as processing
    await supabase.from('ideas').update({ status: 'processing' }).eq('id', idea.id);

    try {
      const projectContext = await getProjectContext();
      const messages = [
        {
          role: 'system',
          content: `You are a senior developer and product advisor for this project. Use the project context below to give implementation-specific advice grounded in the actual codebase — reference real files, services, tables, and patterns.

${projectContext}

When given an idea, flesh it out with practical, project-specific details. Respond in JSON with exactly these keys:
- "summary": A 2-3 sentence expanded description of the idea, explaining how it fits into this project
- "implementation": Concrete implementation steps referencing actual files, services, and DB patterns in this project (3-5 bullet points as a single string, use \\n for line breaks)
- "considerations": Potential challenges specific to this codebase and architecture (2-4 bullet points as a single string, use \\n for line breaks)
- "effort": An effort estimate using one of: "Quick win (< 1 hour)", "Small (a few hours)", "Medium (a day or two)", "Large (a week+)", "Ongoing"
Respond ONLY with valid JSON, no markdown fences.`,
        },
        {
          role: 'user',
          content: `Idea: ${idea.title}${idea.description ? `\n\nDetails: ${idea.description}` : ''}${idea.category ? `\nCategory: ${idea.category}` : ''}`,
        },
      ];

      const result = await chatCompletion(messages);
      const content = result.choices[0]?.message?.content || '';
      console.log('Ideas LLM response:', content.substring(0, 200));

      // Parse JSON response with multiple fallbacks
      const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      let enriched;
      try {
        enriched = JSON.parse(cleaned);
      } catch {
        try {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) enriched = JSON.parse(jsonMatch[0]);
        } catch { /* fall through */ }
      }
      if (!enriched) {
        // Fallback: use the raw text as summary
        enriched = { summary: cleaned, implementation: null, considerations: null, effort: null };
      }

      await supabase
        .from('ideas')
        .update({
          status: 'enriched',
          enriched_summary: enriched.summary || null,
          enriched_implementation: enriched.implementation || null,
          enriched_considerations: enriched.considerations || null,
          enriched_effort: enriched.effort || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', idea.id);

      processed++;
    } catch (err) {
      console.error(`Failed to process idea ${idea.id}:`, err.message);
      await supabase
        .from('ideas')
        .update({
          status: 'failed',
          enriched_summary: `Error: ${err.message}`,
          processed_at: new Date().toISOString(),
        })
        .eq('id', idea.id);
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Auto-generate new ideas by having Groq analyse the GitHub repo.
 * Fetches project context, asks LLM to brainstorm, then inserts as enriched ideas.
 */
export async function generateIdeas(familyId, count = 5) {
  const projectContext = await getProjectContext();

  // Also fetch existing ideas so we don't duplicate
  const existing = await getIdeas(familyId);
  const existingTitles = existing.map(i => i.title.toLowerCase());

  const messages = [
    {
      role: 'system',
      content: `You are a senior developer and product strategist analysing a real GitHub project. Your job is to brainstorm ${count} new feature ideas, improvements, or enhancements based on the actual codebase.

${projectContext}

Look at what already exists and identify:
- Missing features that would make the app more useful for a family
- Improvements to existing features (UX, performance, reliability)
- Integrations with external services that would add value
- Quality of life improvements for the dashboard or Telegram bot
- Fun or creative features that fit the family assistant theme

${existingTitles.length ? `\nALREADY SUGGESTED (do NOT repeat these):\n${existingTitles.join('\n')}` : ''}

Respond with a JSON array of exactly ${count} objects, each with these keys:
- "title": Short, descriptive title (under 60 chars)
- "description": 1-2 sentence description of the idea
- "category": One of "Feature", "Improvement", "Integration", "Fun", "Performance"
- "summary": A 2-3 sentence expanded description explaining how it fits this project
- "implementation": Concrete implementation steps referencing actual files and patterns (3-5 bullet points as a single string, use \\n for line breaks)
- "considerations": Potential challenges specific to this codebase (2-4 bullet points as a single string, use \\n for line breaks)
- "effort": One of "Quick win (< 1 hour)", "Small (a few hours)", "Medium (a day or two)", "Large (a week+)", "Ongoing"

Respond ONLY with a valid JSON array, no markdown fences.`,
    },
    {
      role: 'user',
      content: `Analyse the project and generate ${count} new ideas. Be creative and specific to this codebase.`,
    },
  ];

  const result = await chatCompletion(messages);
  const content = result.choices[0]?.message?.content || '';
  console.log('Ideas generation raw response:', content.substring(0, 500));

  // Parse the JSON array with multiple fallbacks
  const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  let ideas;

  // Attempt 1: parse whole response as JSON
  try { ideas = JSON.parse(cleaned); } catch { /* continue */ }

  // Attempt 2: extract array from response
  if (!ideas) {
    try {
      const arrMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrMatch) ideas = JSON.parse(arrMatch[0]);
    } catch { /* continue */ }
  }

  // Attempt 3: if it's a single object, wrap it
  if (!ideas) {
    try {
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) {
        const obj = JSON.parse(objMatch[0]);
        if (obj.title) ideas = [obj];
      }
    } catch { /* continue */ }
  }

  // Attempt 4: try fixing common JSON issues (trailing commas, unescaped newlines)
  if (!ideas) {
    try {
      const fixed = cleaned
        .replace(/,\s*([}\]])/g, '$1')  // trailing commas
        .replace(/\n/g, '\\n');           // unescaped newlines in strings
      ideas = JSON.parse(fixed);
    } catch { /* continue */ }
  }

  if (!Array.isArray(ideas) || ideas.length === 0) {
    console.error('Failed to parse ideas. Raw content:', content);
    throw new Error(`Failed to parse generated ideas from LLM. Response started with: ${content.substring(0, 100)}`);
  }

  // Filter out duplicates
  const newIdeas = ideas.filter(
    i => i.title && !existingTitles.includes(i.title.toLowerCase())
  );

  // Insert as pre-enriched ideas
  let inserted = 0;
  for (const idea of newIdeas) {
    const { error } = await supabase.from('ideas').insert({
      family_id: familyId,
      title: idea.title,
      description: idea.description || null,
      category: idea.category || null,
      status: 'enriched',
      enriched_summary: idea.summary || null,
      enriched_implementation: idea.implementation || null,
      enriched_considerations: idea.considerations || null,
      enriched_effort: idea.effort || null,
      processed_at: new Date().toISOString(),
    });
    if (!error) inserted++;
  }

  return { generated: inserted, duplicates_skipped: ideas.length - newIdeas.length };
}

// ─── Theorize Pipeline ───────────────────────────────────────────────

const THEORIZE_PASSES = [
  {
    name: 'Problem & Users',
    prompt: `Analyse this idea and define the problem space. Answer these questions:
1. What specific problem does this solve?
2. Who in the family benefits most? (parents, kids, both?)
3. What's the current workaround without this feature?
4. How often would this realistically be used? (daily, weekly, occasionally?)
5. What's the emotional value? (reduces stress, adds fun, saves time?)
Be specific and grounded — this is for a real family assistant app.`,
  },
  {
    name: 'User Stories & Scenarios',
    prompt: `Based on the problem analysis, write concrete user stories and scenarios:
1. Write 3-5 user stories in the format: "As a [parent/child/family], I want to [action], so that [benefit]"
2. Describe 2 detailed scenarios showing how someone would actually use this feature day-to-day
3. What happens when things go wrong? (network down, bad input, edge cases)
4. What's the "delight moment" — the thing that makes a user smile?`,
  },
  {
    name: 'Technical Architecture',
    prompt: `Design the technical implementation for this codebase. Be specific about actual files:
1. Which existing services (services/*.js) need changes and what changes?
2. What new database table(s) or columns are needed? Write the actual SQL.
3. What new API endpoints are needed? List METHOD /path and request/response shape.
4. What new LLM tools/functions should be added for the Telegram bot? (llm/functions.js)
5. Any external APIs or services required? (costs, rate limits, free tier?)
6. What can be reused from existing code patterns?`,
  },
  {
    name: 'UI/UX Design',
    prompt: `Design the user interface and experience:
1. Where does this live? (Dashboard card, standalone page, Telegram bot command, all three?)
2. Walk through the complete user flow step by step — from first interaction to completion
3. What does the MVP (minimum viable) version look like? What's the simplest thing we can ship?
4. What does the "full" version look like with all bells and whistles?
5. Any animations, transitions, or micro-interactions that would elevate it?
6. How does it look on the TV dashboard vs mobile?`,
  },
  {
    name: 'Implementation Plan',
    prompt: `Create a detailed implementation plan:
1. Break this into ordered tasks with clear deliverables
2. Mark dependencies — what must be done before what?
3. Which tasks can be done in parallel?
4. Estimate each task: "30 min", "1-2 hours", "half day", "full day"
5. What's the critical path (shortest time to ship MVP)?
6. Identify any code from existing features that can be copy-adapted`,
  },
  {
    name: 'Risks & Trade-offs',
    prompt: `Evaluate risks, trade-offs, and potential issues:
1. Security or privacy concerns?
2. Performance impact on the dashboard or Telegram bot?
3. API costs (Groq tokens, external services)?
4. Maintenance burden — will this need ongoing attention?
5. What could we cut to ship faster without losing the core value?
6. What's the worst that happens if this feature breaks?
7. Any legal or compliance considerations?`,
  },
  {
    name: 'Final Brief',
    prompt: `Synthesise everything from the previous passes into a final product brief:
1. One-paragraph executive summary
2. Core value proposition (one sentence)
3. MVP scope — exactly what ships first
4. Effort estimate for MVP (total hours)
5. Priority recommendation: "Ship now", "Ship next", "Backlog", or "Skip"
6. Confidence level (1-10) with explanation
7. The single biggest risk and how to mitigate it`,
  },
];

/**
 * Run the multi-pass theorize pipeline for an idea.
 * Each pass builds on all previous passes for richer context.
 */
export async function theorizeIdea(ideaId) {
  // Fetch the idea
  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', ideaId)
    .single();
  if (error || !idea) throw new Error('Idea not found');

  // Get project context for grounding
  const projectContext = await getProjectContext();

  // Mark as running
  await supabase.from('ideas').update({
    theorize_status: 'running',
    theorize_progress: 0,
  }).eq('id', ideaId);

  // Clear any previous theories for this idea
  await supabase.from('idea_theories').delete().eq('idea_id', ideaId);

  const passResults = [];

  for (let i = 0; i < THEORIZE_PASSES.length; i++) {
    const pass = THEORIZE_PASSES[i];

    // Update progress
    await supabase.from('ideas').update({
      theorize_progress: i + 1,
    }).eq('id', ideaId);

    try {
      // Build context from all previous passes
      const previousContext = passResults.length
        ? '\n\n--- PREVIOUS ANALYSIS ---\n' + passResults.map(
            (r, idx) => `## Pass ${idx + 1}: ${THEORIZE_PASSES[idx].name}\n${r}`
          ).join('\n\n')
        : '';

      const messages = [
        {
          role: 'system',
          content: `You are a senior product strategist and developer analysing a feature idea for a family assistant app. You are thorough, practical, and grounded in the real codebase.

${projectContext}

${previousContext}

Now complete Pass ${i + 1} of ${THEORIZE_PASSES.length}: "${pass.name}"`,
        },
        {
          role: 'user',
          content: `Idea: ${idea.title}${idea.description ? `\nDescription: ${idea.description}` : ''}${idea.category ? `\nCategory: ${idea.category}` : ''}${idea.enriched_summary ? `\nInitial Summary: ${idea.enriched_summary}` : ''}

${pass.prompt}`,
        },
      ];

      const result = await chatCompletion(messages);
      const content = result.choices[0]?.message?.content || '';

      // Store this pass
      await supabase.from('idea_theories').insert({
        idea_id: ideaId,
        pass_number: i + 1,
        pass_name: pass.name,
        content,
      });

      passResults.push(content);
      console.log(`Theorize pass ${i + 1}/${THEORIZE_PASSES.length} complete for idea ${ideaId}`);
    } catch (err) {
      console.error(`Theorize pass ${i + 1} failed:`, err.message);
      await supabase.from('idea_theories').insert({
        idea_id: ideaId,
        pass_number: i + 1,
        pass_name: pass.name,
        content: `Error: ${err.message}`,
      });
      passResults.push(`[Failed: ${err.message}]`);
    }
  }

  // Mark complete
  await supabase.from('ideas').update({
    theorize_status: 'complete',
    theorize_progress: THEORIZE_PASSES.length,
  }).eq('id', ideaId);

  return { passes: THEORIZE_PASSES.length, completed: passResults.length };
}

/**
 * Get theorize results for an idea.
 */
export async function getTheories(ideaId) {
  const { data, error } = await supabase
    .from('idea_theories')
    .select('*')
    .eq('idea_id', ideaId)
    .order('pass_number');
  if (error) throw error;
  return data || [];
}

export const TOTAL_PASSES = THEORIZE_PASSES.length;
