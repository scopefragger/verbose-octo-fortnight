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
