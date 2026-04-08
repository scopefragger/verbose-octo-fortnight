import { supabaseAuth } from '../db/supabase.js';

// Cache verified tokens for 5 minutes to avoid hammering Supabase Auth
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 5 * 60 * 1000;

// Evict expired entries every 10 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of tokenCache) {
    if (now - entry.timestamp >= TOKEN_CACHE_TTL) tokenCache.delete(token);
  }
}, 10 * 60 * 1000).unref();

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
 * Auth middleware — accepts EITHER:
 *   1. ?secret=CRON_SECRET query param (backward compat + crons)
 *   2. sb_access_token cookie (Supabase Auth session)
 *
 * This dual-mode ensures everything keeps working while auth is rolling out.
 */
export function requireAuth(req, res, next) {
  // Mode 1: Shared secret (always works — crons, direct API, dashboard fallback)
  if (req.query.secret && req.query.secret === process.env.CRON_SECRET) {
    req.authMode = 'secret';
    return next();
  }

  // Mode 2: Session cookie
  const accessToken = req.cookies?.sb_access_token;

  if (!accessToken) {
    // No cookie AND no secret — redirect HTML pages to login, 401 for API
    if (req.accepts('html') && !req.path.startsWith('/api/') && !req.path.startsWith('/cron/')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!supabaseAuth) {
    console.error('Auth: SUPABASE_ANON_KEY not set — falling back to cookie-only mode');
    // If anon key not configured, trust the cookie exists (graceful degradation)
    req.authMode = 'session';
    return next();
  }

  verifyToken(accessToken).then((user) => {
    if (!user) {
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
