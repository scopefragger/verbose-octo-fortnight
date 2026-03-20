import { supabase } from '../db/supabase.js';

/**
 * All available dashboard themes.
 */
export const THEMES = {
  // Default
  default: { name: 'Default', category: 'general' },

  // Holiday themes
  christmas: { name: 'Christmas', category: 'holiday' },
  halloween: { name: 'Halloween', category: 'holiday' },
  easter: { name: 'Easter', category: 'holiday' },
  valentines: { name: "Valentine's Day", category: 'holiday' },
  bonfire: { name: 'Bonfire Night', category: 'holiday' },
  newyear: { name: "New Year's", category: 'holiday' },
  stpatricks: { name: "St Patrick's Day", category: 'holiday' },
  thanksgiving: { name: 'Thanksgiving', category: 'holiday' },
  summer: { name: 'Summer', category: 'holiday' },

  // Disney themes
  frozen: { name: 'Frozen', category: 'disney' },
  starwars: { name: 'Star Wars', category: 'disney' },
  princess: { name: 'Princess', category: 'disney' },
  pixar: { name: 'Pixar', category: 'disney' },
  villains: { name: 'Villains', category: 'disney' },
  mickey: { name: 'Mickey & Friends', category: 'disney' },
  moana: { name: 'Moana', category: 'disney' },
  encanto: { name: 'Encanto', category: 'disney' },
};

/**
 * Get the current theme for a family.
 */
export async function getTheme(familyId) {
  const { data, error } = await supabase
    .from('families')
    .select('dashboard_theme')
    .eq('id', familyId)
    .single();

  if (error) throw error;
  return data?.dashboard_theme || 'default';
}

/**
 * Set the dashboard theme for a family.
 */
export async function setTheme(familyId, themeKey) {
  const key = (themeKey || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!THEMES[key]) {
    throw new Error(`Unknown theme "${themeKey}". Available: ${Object.keys(THEMES).join(', ')}`);
  }

  const { data, error } = await supabase
    .from('families')
    .update({ dashboard_theme: key })
    .eq('id', familyId)
    .select()
    .single();

  if (error) throw error;
  return { theme: key, name: THEMES[key].name };
}

/**
 * List all available themes grouped by category.
 */
export function listThemes() {
  const grouped = { general: [], holiday: [], disney: [] };
  for (const [key, info] of Object.entries(THEMES)) {
    grouped[info.category].push({ key, name: info.name });
  }
  return grouped;
}
