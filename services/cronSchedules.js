import { supabase } from '../db/supabase.js';

const CRON_DEFINITIONS = [
  {
    name: 'check',
    human_label: 'Reminder checker',
    description: 'Checks for due reminders every 5 minutes and sends them via WhatsApp',
    expected_interval_minutes: 10,
  },
  {
    name: 'daily',
    human_label: 'Daily digest',
    description: 'Sends everyone a morning summary of events, meals, reminders, and more',
    expected_interval_minutes: 26 * 60,
  },
  {
    name: 'weekly',
    human_label: 'Weekly overview',
    description: 'Sends a weekly planner and meal plan summary every Sunday',
    expected_interval_minutes: 8 * 24 * 60,
  },
  {
    name: 'cleanup',
    human_label: 'Data cleanup',
    description: 'Removes old conversations and logs nightly to keep storage healthy',
    expected_interval_minutes: 26 * 60,
  },
  {
    name: 'flights',
    human_label: 'Flight reminders',
    description: 'Sends 12-hour pre-departure reminders for upcoming flights (runs every 30 min)',
    expected_interval_minutes: 60,
  },
  {
    name: 'ideas',
    human_label: 'Ideas processor',
    description: 'Reviews and processes queued family ideas through the AI analysis pipeline',
    expected_interval_minutes: 26 * 60,
  },
  {
    name: 'ideas-generate',
    human_label: 'Ideas generator',
    description: "Generates new ideas from your family's activity patterns overnight",
    expected_interval_minutes: 26 * 60,
  },
];

// Ping the crons table — returns false if the table doesn't exist yet (pre-migration).
export async function isDbReady() {
  const { error } = await supabase.from('crons').select('id').limit(1);
  return !error;
}

// Upsert the static cron definitions for a family. Safe to call on every startup.
export async function seedCrons(familyId) {
  for (const def of CRON_DEFINITIONS) {
    const { error } = await supabase.from('crons').upsert(
      {
        family_id: familyId,
        name: def.name,
        human_label: def.human_label,
        description: def.description,
      },
      { onConflict: 'family_id,name' }
    );
    if (error) console.error(`Failed to seed cron "${def.name}":`, error.message);
  }
}

// Returns all crons with their last run info and a computed health status.
export async function getCronStatus(familyId) {
  const { data: crons, error } = await supabase
    .from('crons')
    .select('*')
    .eq('family_id', familyId)
    .order('name');
  if (error) throw error;

  const intervalByName = Object.fromEntries(
    CRON_DEFINITIONS.map((d) => [d.name, d.expected_interval_minutes])
  );

  const results = await Promise.all(
    crons.map(async (cron) => {
      const { data: lastRun } = await supabase
        .from('cron_runs')
        .select('started_at, completed_at, status, error_message')
        .eq('family_id', familyId)
        .eq('cron_name', cron.name)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const expectedMinutes = intervalByName[cron.name] ?? 26 * 60;
      const health = computeHealth(lastRun, expectedMinutes);

      return {
        name: cron.name,
        human_label: cron.human_label,
        description: cron.description,
        enabled: cron.enabled,
        last_run_started: cron.last_run_started,
        last_run_completed: cron.last_run_completed,
        expected_interval_minutes: expectedMinutes,
        last_run: lastRun || null,
        health,
      };
    })
  );

  return results;
}

// Check enabled + overlap, then log the start of a run.
// Returns the cron_runs row id, or null if the run should be skipped.
export async function startCronRun(familyId, cronName) {
  const { data: cron } = await supabase
    .from('crons')
    .select('enabled')
    .eq('family_id', familyId)
    .eq('name', cronName)
    .maybeSingle();

  if (!cron) {
    // Cron not seeded yet — allow the run but don't track it
    return 'untracked';
  }

  if (!cron.enabled) {
    console.log(`Cron "${cronName}" is disabled — skipping`);
    return null;
  }

  // Overlap guard: skip if a run started within the last 15 minutes is still 'running'
  const lockWindow = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: overlap } = await supabase
    .from('cron_runs')
    .select('id')
    .eq('family_id', familyId)
    .eq('cron_name', cronName)
    .eq('status', 'running')
    .gte('started_at', lockWindow)
    .limit(1)
    .maybeSingle();

  if (overlap) {
    console.log(`Cron "${cronName}" overlap detected — skipping`);
    return null;
  }

  await supabase
    .from('crons')
    .update({ last_run_started: new Date().toISOString() })
    .eq('family_id', familyId)
    .eq('name', cronName);

  const { data: run, error } = await supabase
    .from('cron_runs')
    .insert({ family_id: familyId, cron_name: cronName, status: 'running' })
    .select('id')
    .single();
  if (error) throw error;
  return run.id;
}

export async function completeCronRun(familyId, cronName, runId, result = {}) {
  if (runId === 'untracked') return;
  const now = new Date().toISOString();
  await Promise.all([
    supabase
      .from('cron_runs')
      .update({ status: 'success', completed_at: now, result })
      .eq('id', runId),
    supabase
      .from('crons')
      .update({ last_run_completed: now })
      .eq('family_id', familyId)
      .eq('name', cronName),
  ]);
}

export async function failCronRun(familyId, cronName, runId, errorMessage) {
  if (runId === 'untracked') return;
  const now = new Date().toISOString();
  await Promise.all([
    supabase
      .from('cron_runs')
      .update({ status: 'error', completed_at: now, error_message: errorMessage })
      .eq('id', runId),
    supabase
      .from('crons')
      .update({ last_run_completed: now })
      .eq('family_id', familyId)
      .eq('name', cronName),
  ]);
}

// health: 'green' | 'yellow' | 'red' | 'unknown'
function computeHealth(lastRun, expectedIntervalMinutes) {
  if (!lastRun) return 'unknown';
  if (lastRun.status === 'running') return 'yellow';
  if (lastRun.status === 'error') return 'red';
  const elapsed = (Date.now() - new Date(lastRun.started_at).getTime()) / 60000;
  return elapsed > expectedIntervalMinutes * 1.5 ? 'yellow' : 'green';
}
