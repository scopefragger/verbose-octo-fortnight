import { supabaseAuth } from '../db/supabase.js';

// Cache verified tokens for 5 minutes to avoid hammering Supabase Auth
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 5 * 60 * 1000;

async function verifyToken(accessToken) {
  const cached = tokenCache.get(accessToken);
  if (cached && Date.now() - cached.timestamp < TOKEN_CACHE_TTL) {
    return cached.user;
  }

  if (!supabaseAuth) return null;

  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  if (error || !data?.user) {
    console.error('Auth verification failed:', error?.message || 'no user');
    tokenCache.delete(accessToken);
    return null;
  }

  tokenCache.set(accessToken, { user: data.user, timestamp: Date.now() });
  return data.user;
}

/**
 * Auth middleware — Supabase session cookies only.
 * Dashboard and API endpoints require a valid login session.
 * Redirects unauthenticated page requests to /login.
 */
export function requireAuth(req, res, next) {
  const accessToken = req.cookies?.sb_access_token;
  console.log(`Auth: ${req.method} ${req.path} — ${accessToken ? 'cookie present' : 'no cookie'}`);

  if (!accessToken) {
    if (req.accepts('html') && !req.path.startsWith('/api/') && !req.path.startsWith('/cron/')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!supabaseAuth) {
    console.error('Auth: SUPABASE_ANON_KEY not set');
    return res.status(500).json({ error: 'Auth not configured (missing SUPABASE_ANON_KEY)' });
  }

  verifyToken(accessToken).then((user) => {
    if (!user) {
      // Clear bad cookies
      res.clearCookie('sb_access_token', { path: '/' });
      res.clearCookie('sb_refresh_token', { path: '/' });
      if (req.accepts('html') && !req.path.startsWith('/api/')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ error: 'session_expired' });
    }
    req.authMode = 'session';
    req.authUser = user;
    next();
  }).catch((err) => {
    console.error('Auth middleware error:', err.message);
    res.clearCookie('sb_access_token', { path: '/' });
    res.clearCookie('sb_refresh_token', { path: '/' });
    return res.status(401).json({ error: 'unauthorized' });
  });
}

/**
 * Cron-only auth — accepts ONLY the shared secret.
 */
export function requireCronSecret(req, res, next) {
  if (req.query.secret && req.query.secret === process.env.CRON_SECRET) {
    req.authMode = 'secret';
    return next();
  }
  return res.status(401).json({ error: 'unauthorized' });
}
