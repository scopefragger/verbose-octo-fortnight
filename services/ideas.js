import { supabase } from '../db/supabase.js';
import { chatCompletion } from '../llm/groq.js';

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
      const messages = [
        {
          role: 'system',
          content: `You are a helpful product/project advisor for a family assistant app. When given an idea or concept, flesh it out with practical details. Respond in JSON with exactly these keys:
- "summary": A 2-3 sentence expanded description of the idea
- "implementation": Concrete steps or approach to make this happen (3-5 bullet points as a single string, use \\n for line breaks)
- "considerations": Potential challenges, risks, or things to think about (2-4 bullet points as a single string, use \\n for line breaks)
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
