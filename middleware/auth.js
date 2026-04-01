import { supabaseAuth } from '../db/supabase.js';

/**
 * Auth middleware — Supabase session cookies only.
 * Dashboard and API endpoints require a valid login session.
 * Redirects unauthenticated page requests to /login.
 */
export function requireAuth(req, res, next) {
  const accessToken = req.cookies?.sb_access_token;
  if (accessToken) {
    console.log(`Auth: ${req.method} ${req.path} — cookie present (${accessToken.substring(0, 20)}...)`);
  } else {
    console.log(`Auth: ${req.method} ${req.path} — no cookie`);
  }
  if (!accessToken) {
    if (req.accepts('html') && !req.path.startsWith('/api/') && !req.path.startsWith('/cron/')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!supabaseAuth) {
    return res.status(500).json({ error: 'Auth not configured (missing SUPABASE_ANON_KEY)' });
  }

  supabaseAuth.auth.getUser(accessToken).then(({ data, error }) => {
    if (error || !data?.user) {
      console.error('Auth verification failed:', error?.message || 'no user returned');
      // Clear bad cookies
      res.clearCookie('sb_access_token', { path: '/' });
      res.clearCookie('sb_refresh_token', { path: '/' });
      if (req.accepts('html') && !req.path.startsWith('/api/')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ error: 'session_expired' });
    }
    req.authMode = 'session';
    req.authUser = data.user;
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
 * Used for /cron/* endpoints called by cron-job.org.
 */
export function requireCronSecret(req, res, next) {
  if (req.query.secret && req.query.secret === process.env.CRON_SECRET) {
    req.authMode = 'secret';
    return next();
  }
  return res.status(401).json({ error: 'unauthorized' });
}
