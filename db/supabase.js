import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Missing env vars. SUPABASE_URL:', url ? 'set' : 'MISSING', '| SUPABASE_SERVICE_KEY:', key ? 'set' : 'MISSING');
  console.error('All env keys:', Object.keys(process.env).filter(k => k.includes('SUPA')).join(', ') || '(none with SUPA)');
  process.exit(1);
}

const supabase = createClient(url, key);

// Auth client uses anon key (required for Supabase Auth operations)
const anonKey = process.env.SUPABASE_ANON_KEY;
const supabaseAuth = anonKey ? createClient(url, anonKey) : null;

export { supabase, supabaseAuth };
