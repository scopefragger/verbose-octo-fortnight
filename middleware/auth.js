import { supabaseAuth } from '../db/supabase.js';

/**
 * Dual-mode auth middleware.
 * Accepts EITHER:
 *   1. ?secret=CRON_SECRET query param (for cron jobs, external tools)
 *   2. sb_access_token cookie (for dashboard users logged in via Supabase Auth)
 *
 * Sets req.authMode = 'secret' | 'session' so downstream handlers know which.
 */
export function requireAuth(req, res, next) {
  // Mode 1: Shared secret (crons, API tools)
  if (req.query.secret && req.query.secret === process.env.CRON_SECRET) {
    req.authMode = 'secret';
    return next();
  }

  // Mode 2: Session cookie (dashboard users)
  const accessToken = req.cookies?.sb_access_token;
  if (!accessToken) {
    // For HTML page requests, redirect to login
    if (req.accepts('html') && !req.path.startsWith('/api/') && !req.path.startsWith('/cron/')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Verify token with Supabase
  if (!supabaseAuth) {
    return res.status(500).json({ error: 'Auth not configured (missing SUPABASE_ANON_KEY)' });
  }

  supabaseAuth.auth.getUser(accessToken).then(({ data, error }) => {
    if (error || !data?.user) {
      // Token expired or invalid — try to redirect to login for page requests
      if (req.accepts('html') && !req.path.startsWith('/api/')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ error: 'session_expired' });
    }
    req.authMode = 'session';
    req.authUser = data.user;
    next();
  }).catch(() => {
    return res.status(401).json({ error: 'unauthorized' });
  });
}
