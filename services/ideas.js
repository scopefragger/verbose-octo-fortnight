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
  {
    name: 'Persona: Wife (Mum)',
    prompt: `You are now role-playing as the WIFE/MUM of this family. You are a busy parent who manages much of the household logistics — meals, school runs, appointments, social calendar. You're tech-comfortable but time-poor. You value things that genuinely save time, not gimmicks.

React to this feature idea honestly from your perspective:
1. First reaction — would you actually use this? Be brutally honest.
2. What would make you love it vs ignore it?
3. What's annoying or missing from your point of view?
4. How does this fit into your daily routine? Walk through a real scenario.
5. Would you tell other mums about it? Why or why not?
6. Rate it: "Need it" / "Nice to have" / "Meh" / "Please don't" — and explain why.
7. What one change would make this a must-have for you?`,
  },
  {
    name: 'Persona: Husband (Dad)',
    prompt: `You are now role-playing as the HUSBAND/DAD. You're the one who set up this family assistant — you enjoy the tech side and building features. But you also need to be honest about what the family will actually use vs what's just cool to build.

React to this feature from your perspective:
1. First reaction — is this something you'd build on a weekend or put off forever?
2. How excited are you to build this (1-10)? How excited is the family to USE it (1-10)?
3. Will this create more maintenance burden for you? Are you OK with that?
4. Does this make the dashboard/bot more useful or more cluttered?
5. How does this fit with the existing features? Does it complement or compete?
6. Rate it: "Build now" / "Build next" / "Backlog forever" / "Over-engineered" — explain.
7. What's the laziest version of this you could ship that still delivers value?`,
  },
  {
    name: 'Persona: 8-Year-Old Girl',
    prompt: `You are now role-playing as the 8-YEAR-OLD DAUGHTER. You're in primary school, you like Disney, crafts, reading, and playing with your younger brother. You use the family dashboard on the TV and sometimes ask mum or dad to check things on the bot. You like earning points and Mickey Heads.

React to this feature in a way an 8-year-old would:
1. Do you understand what this does? Explain it back in kid language.
2. Is this boring or fun? Why?
3. Would you ask mum or dad to use it, or would you forget it exists?
4. Does this help you with anything YOU care about? (school, fun, points, family time?)
5. What would make it more fun for a kid?
6. Rate it with emojis: 🤩 / 😊 / 😐 / 😴
7. If you could add ONE thing to make it cooler, what would it be?`,
  },
  {
    name: 'Persona: 6-Year-Old Boy',
    prompt: `You are now role-playing as the 6-YEAR-OLD SON. You're in Year 1, you love dinosaurs, superheroes, Lego, and being silly. You can't really read much yet so you rely on pictures and mum/dad reading things to you. You like the dashboard when it shows fun stuff. You LOVE earning points.

React to this feature the way a 6-year-old boy would:
1. Would you even notice this feature? Be honest.
2. Is there anything cool or fun about it for YOU?
3. Can you use it yourself or do you need a grown-up?
4. Does it have any pictures, colours, or sounds? (If not, that's boring!)
5. Would you rather have this or something else? What else?
6. Rate it: 🦖 (AWESOME) / 👍 (OK) / 🥱 (Boring) / 🙈 (Don't care)
7. What would make a 6-year-old boy actually excited about this?`,
  },
  {
    name: 'Improvement Suggestions',
    prompt: `You've now seen the full technical analysis (passes 1-7) AND the reactions from all four family members (passes 8-11).

Synthesise the persona feedback and suggest concrete improvements:
1. What are the COMMON themes across all personas? (things everyone wants or everyone dislikes)
2. List 5-8 specific improvement ideas that address the persona feedback. For each:
   - What it is (one line)
   - Which persona(s) it addresses
   - Effort: "Quick win" / "Medium" / "Significant"
   - Impact: "High" / "Medium" / "Low"
3. Which improvements should be rolled into the MVP?
4. Which improvements are great follow-ups for v2?
5. Does the persona feedback change the priority recommendation from the Final Brief?
6. Write a revised one-paragraph executive summary that incorporates the key persona insights.
7. Final verdict: Should we build this? Adjusted confidence score (1-10).`,
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

/**
 * Suggest additional improvements for an idea based on its theories.
 * Returns AI-generated suggestions for enhancing the concept.
 */
export async function suggestImprovements(ideaId) {
  const { data: idea } = await supabase.from('ideas').select('*').eq('id', ideaId).single();
  if (!idea) throw new Error('Idea not found');

  const theories = await getTheories(ideaId);
  if (!theories.length) throw new Error('No theories found — run Theorize first');

  const projectContext = await getProjectContext();
  const theoryContext = theories.map(t => `## ${t.pass_name}\n${t.content}`).join('\n\n');

  const messages = [
    {
      role: 'system',
      content: `You are a creative product strategist. You have access to a full analysis of a feature idea including persona tests from family members.\n\n${projectContext}`,
    },
    {
      role: 'user',
      content: `Here is the full analysis for the idea "${idea.title}":\n\n${theoryContext}\n\nBased on ALL of this analysis and persona feedback, suggest additional concept enhancements we haven't considered yet. Think creatively — what adjacent features, integrations, delightful touches, or pivots could make this even better?\n\nReturn a JSON array of suggestions, each with:\n- "title": short name (5-10 words)\n- "description": what it is and why (2-3 sentences)\n- "persona_appeal": which family members would love this (array of "mum", "dad", "daughter", "son")\n- "effort": "quick" | "medium" | "significant"\n- "impact": "high" | "medium" | "low"\n\nReturn 5-8 suggestions. Return ONLY the JSON array, no other text.`,
    },
  ];

  const result = await chatCompletion(messages);
  const raw = result.choices[0]?.message?.content || '[]';

  // Parse with fallbacks
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  }
}

/**
 * Retheorize an idea with user adjustments/notes.
 * Keeps previous theories as context and re-runs with adjustments applied.
 */
export async function retheorizeIdea(ideaId, adjustments) {
  const { data: idea } = await supabase.from('ideas').select('*').eq('id', ideaId).single();
  if (!idea) throw new Error('Idea not found');

  const previousTheories = await getTheories(ideaId);
  const previousContext = previousTheories.map(t => `## ${t.pass_name}\n${t.content}`).join('\n\n');

  // Update the idea description with adjustments
  const adjustedDescription = `${idea.description || ''}\n\n--- ADJUSTMENTS FROM REVIEW ---\n${adjustments}`.trim();
  await supabase.from('ideas').update({ description: adjustedDescription }).eq('id', ideaId);

  // Mark as running and clear old theories
  await supabase.from('ideas').update({
    theorize_status: 'running',
    theorize_progress: 0,
  }).eq('id', ideaId);
  await supabase.from('idea_theories').delete().eq('idea_id', ideaId);

  const projectContext = await getProjectContext();
  const passResults = [];

  for (let i = 0; i < THEORIZE_PASSES.length; i++) {
    const pass = THEORIZE_PASSES[i];

    await supabase.from('ideas').update({ theorize_progress: i + 1 }).eq('id', ideaId);

    try {
      const priorPasses = passResults.length
        ? '\n\n--- CURRENT RE-ANALYSIS ---\n' + passResults.map(
            (r, idx) => `## Pass ${idx + 1}: ${THEORIZE_PASSES[idx].name}\n${r}`
          ).join('\n\n')
        : '';

      const messages = [
        {
          role: 'system',
          content: `You are a senior product strategist RE-ANALYSING a feature idea that has been adjusted based on family persona feedback. The user has reviewed the previous analysis and wants changes.

${projectContext}

--- PREVIOUS ANALYSIS (before adjustments) ---
${previousContext}

--- USER ADJUSTMENTS ---
${adjustments}

${priorPasses}

Now complete Pass ${i + 1} of ${THEORIZE_PASSES.length}: "${pass.name}"
IMPORTANT: Incorporate the user's adjustments into your analysis. This is a revised version, not a repeat.`,
        },
        {
          role: 'user',
          content: `Idea: ${idea.title}${idea.description ? `\nDescription: ${idea.description}` : ''}${idea.category ? `\nCategory: ${idea.category}` : ''}

${pass.prompt}`,
        },
      ];

      const result = await chatCompletion(messages);
      const content = result.choices[0]?.message?.content || '';

      await supabase.from('idea_theories').insert({
        idea_id: ideaId,
        pass_number: i + 1,
        pass_name: pass.name,
        content,
      });

      passResults.push(content);
      console.log(`Retheorize pass ${i + 1}/${THEORIZE_PASSES.length} complete for idea ${ideaId}`);
    } catch (err) {
      console.error(`Retheorize pass ${i + 1} failed:`, err.message);
      await supabase.from('idea_theories').insert({
        idea_id: ideaId,
        pass_number: i + 1,
        pass_name: pass.name,
        content: `Error: ${err.message}`,
      });
      passResults.push(`[Failed: ${err.message}]`);
    }
  }

  await supabase.from('ideas').update({
    theorize_status: 'complete',
    theorize_progress: THEORIZE_PASSES.length,
  }).eq('id', ideaId);

  return { passes: THEORIZE_PASSES.length, completed: passResults.length };
}

export const TOTAL_PASSES = THEORIZE_PASSES.length;
