import { Router } from 'express';
import { supabaseAuth } from '../db/supabase.js';

const router = Router();

// Cookie options
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// GET /login — serve login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.cookies?.sb_access_token) {
    return res.redirect('/dashboard');
  }

  res.send(LOGIN_HTML);
});

// POST /api/auth/login — authenticate with Supabase
router.post('/api/auth/login', async (req, res) => {
  if (!supabaseAuth) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // Set cookies
  res.cookie('sb_access_token', data.session.access_token, COOKIE_OPTS);
  res.cookie('sb_refresh_token', data.session.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({ ok: true, user: { email: data.user.email, id: data.user.id } });
});

// POST /api/auth/logout
router.post('/api/auth/logout', (req, res) => {
  res.clearCookie('sb_access_token', { path: '/' });
  res.clearCookie('sb_refresh_token', { path: '/' });
  res.json({ ok: true });
});

// POST /api/auth/refresh — refresh access token
router.post('/api/auth/refresh', async (req, res) => {
  if (!supabaseAuth) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  const refreshToken = req.cookies?.sb_refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    res.clearCookie('sb_access_token', { path: '/' });
    res.clearCookie('sb_refresh_token', { path: '/' });
    return res.status(401).json({ error: 'Refresh failed' });
  }

  res.cookie('sb_access_token', data.session.access_token, COOKIE_OPTS);
  res.cookie('sb_refresh_token', data.session.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

// Login page HTML
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Dashboard — Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: #fff;
      border-radius: 20px;
      padding: 40px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-card h1 {
      text-align: center;
      margin-bottom: 8px;
      font-size: 28px;
      color: #333;
    }
    .login-card .subtitle {
      text-align: center;
      color: #888;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #555;
      margin-bottom: 6px;
    }
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      transition: border-color 0.2s;
      outline: none;
    }
    .form-group input:focus {
      border-color: #667eea;
    }
    .login-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      margin-top: 8px;
    }
    .login-btn:hover { opacity: 0.9; }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg {
      background: #fef2f2;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .logo {
      text-align: center;
      font-size: 48px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="logo">&#x1F3E0;</div>
    <h1>Family Dashboard</h1>
    <p class="subtitle">Sign in to continue</p>
    <div class="error-msg" id="errorMsg"></div>
    <form id="loginForm">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" required autocomplete="email" placeholder="you@example.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" required autocomplete="current-password" placeholder="Your password">
      </div>
      <button type="submit" class="login-btn" id="loginBtn">Sign In</button>
    </form>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const errEl = document.getElementById('errorMsg');
      errEl.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }
        window.location.href = '/dashboard';
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  </script>
</body>
</html>`;

export default router;
