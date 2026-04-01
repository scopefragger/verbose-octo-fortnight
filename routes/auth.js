import { Router } from 'express';
import { supabaseAuth } from '../db/supabase.js';

const router = Router();

// Cookie options
const isProduction = Boolean(process.env.WEBHOOK_URL || process.env.NODE_ENV === 'production');
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// GET /login — serve login page
router.get('/login', async (req, res) => {
  // If already logged in with a valid token, redirect to dashboard
  const token = req.cookies?.sb_access_token;
  if (token && supabaseAuth) {
    try {
      const { data, error } = await supabaseAuth.auth.getUser(token);
      if (!error && data?.user) {
        return res.redirect('/dashboard');
      }
    } catch { /* token invalid, show login */ }
    // Token is bad — clear it
    res.clearCookie('sb_access_token', { path: '/' });
    res.clearCookie('sb_refresh_token', { path: '/' });
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

// Login page HTML — Disney castle themed
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Dashboard</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Quicksand:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Quicksand', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #0a0a2e;
    }

    /* Starry night sky background */
    .sky {
      position: fixed;
      inset: 0;
      background: linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 40%, #2d1b69 70%, #4a2c8a 100%);
      z-index: 0;
    }
    .stars {
      position: fixed;
      inset: 0;
      z-index: 1;
    }
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #fff;
      border-radius: 50%;
      animation: twinkle var(--dur, 3s) ease-in-out infinite;
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    /* Shooting star */
    .shooting-star {
      position: fixed;
      width: 100px;
      height: 2px;
      background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
      border-radius: 2px;
      z-index: 2;
      opacity: 0;
      animation: shoot 6s ease-in-out infinite;
      animation-delay: 3s;
      top: 15%;
      left: -100px;
      transform: rotate(-15deg);
    }
    @keyframes shoot {
      0% { left: -100px; opacity: 0; }
      5% { opacity: 1; }
      15% { left: 110%; opacity: 0; }
      100% { opacity: 0; }
    }

    /* Castle silhouette */
    .castle-scene {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      width: 600px;
      max-width: 90vw;
      opacity: 0.15;
    }
    .castle-svg {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 0 20px rgba(100,150,255,0.3));
    }

    /* Fireflies */
    .firefly {
      position: fixed;
      width: 4px;
      height: 4px;
      background: #ffd700;
      border-radius: 50%;
      box-shadow: 0 0 8px 2px rgba(255,215,0,0.6);
      z-index: 4;
      animation: float var(--dur, 8s) ease-in-out infinite;
      opacity: 0;
    }
    @keyframes float {
      0%, 100% { opacity: 0; transform: translate(0, 0); }
      25% { opacity: 0.8; transform: translate(30px, -20px); }
      50% { opacity: 0.4; transform: translate(-10px, -40px); }
      75% { opacity: 0.9; transform: translate(20px, -10px); }
    }

    /* Login card */
    .login-container {
      position: relative;
      z-index: 10;
      width: 90%;
      max-width: 400px;
    }
    .login-card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 44px 36px 36px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
    }
    .castle-icon {
      text-align: center;
      font-size: 52px;
      margin-bottom: 8px;
      filter: drop-shadow(0 2px 8px rgba(255,215,0,0.4));
    }
    .login-card h1 {
      text-align: center;
      font-family: 'Cinzel Decorative', cursive;
      font-size: 22px;
      color: #fff;
      margin-bottom: 4px;
      letter-spacing: 1px;
      text-shadow: 0 2px 12px rgba(100,150,255,0.4);
    }
    .login-card .subtitle {
      text-align: center;
      color: rgba(255,255,255,0.5);
      margin-bottom: 28px;
      font-size: 13px;
      font-weight: 500;
    }
    .sparkle-divider {
      text-align: center;
      margin-bottom: 24px;
      font-size: 11px;
      letter-spacing: 8px;
      color: rgba(255,215,0,0.4);
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      margin-bottom: 6px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .form-group input {
      width: 100%;
      padding: 13px 16px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      font-size: 15px;
      font-family: 'Quicksand', sans-serif;
      color: #fff;
      transition: all 0.3s;
      outline: none;
    }
    .form-group input::placeholder {
      color: rgba(255,255,255,0.3);
    }
    .form-group input:focus {
      border-color: rgba(100,150,255,0.6);
      background: rgba(255,255,255,0.12);
      box-shadow: 0 0 20px rgba(100,150,255,0.15);
    }
    .login-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4a6cf7 0%, #7b5ea7 50%, #c77dba 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Quicksand', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
      letter-spacing: 0.5px;
      position: relative;
      overflow: hidden;
    }
    .login-btn::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .login-btn:hover::before { opacity: 1; }
    .login-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(74,108,247,0.4);
    }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .error-msg {
      background: rgba(220,38,38,0.15);
      border: 1px solid rgba(220,38,38,0.3);
      color: #fca5a5;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }

    /* Magic sparkle on successful login */
    @keyframes magicBurst {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(3); opacity: 0; }
    }
    .magic-burst {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, rgba(255,215,0,0.3), transparent 60%);
      z-index: 100;
      animation: magicBurst 0.8s ease-out forwards;
    }
  </style>
</head>
<body>
  <div class="sky"></div>
  <div class="stars" id="stars"></div>
  <div class="shooting-star"></div>

  <div class="login-container">
    <div class="login-card">
      <div class="castle-icon">&#x1F3F0;</div>
      <h1>Family Dashboard</h1>
      <p class="subtitle">Sign in to continue</p>
      <div class="sparkle-divider">&#x2728; &#x2728; &#x2728;</div>
      <div class="error-msg" id="errorMsg"></div>
      <form id="loginForm">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="email" required autocomplete="email" placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password" required autocomplete="current-password" placeholder="Enter your password">
        </div>
        <button type="submit" class="login-btn" id="loginBtn">&#x2728; Enter the Kingdom</button>
      </form>
    </div>
  </div>

  <script>
    // Generate random stars
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 70 + '%';
      star.style.width = (Math.random() * 2.5 + 0.5) + 'px';
      star.style.height = star.style.width;
      star.style.setProperty('--dur', (Math.random() * 4 + 2) + 's');
      star.style.animationDelay = (Math.random() * 5) + 's';
      starsContainer.appendChild(star);
    }

    // Hidden Disney character constellations made of brighter stars
    // Each constellation is a set of [x%, y%] points that trace a character
    const constellations = [
      // Mickey Mouse head (top-left area) — three circles
      { points: [
        [12,8],[14,6],[16,5],[18,6],[20,8], // left ear
        [26,8],[28,6],[30,5],[32,6],[34,8], // right ear
        [15,12],[17,15],[19,18],[23,18],[25,15],[27,12], // head outline
        [20,14],[22,14],[21,16], // face dots
      ], color: 'rgba(255,255,255,0.6)' },
      // Tinkerbell flying (right side) — wand trail + wings
      { points: [
        [82,12],[83,14],[84,16],[83,18],[82,20], // body
        [80,14],[78,13],[79,11], // left wing
        [86,14],[88,13],[87,11], // right wing
        [84,10],[86,8],[88,7],[90,6],[92,5],[94,5], // wand trail sparkles
      ], color: 'rgba(255,215,0,0.5)' },
      // Nemo fish (bottom-left) — small clownfish shape
      { points: [
        [8,42],[10,40],[12,38],[14,38],[16,40],[17,42],[16,44],[14,44],[12,44],[10,44], // body
        [17,41],[19,39],[19,43], // tail
        [11,41], // eye
      ], color: 'rgba(255,140,50,0.45)' },
      // Magic wand with star (top-right)
      { points: [
        [72,22],[73,20],[74,18],[75,16],[76,14], // wand line
        [76,11],[78,12],[77,14],[75,13],[76,11], // star shape
        [74,10],[78,10],[76,8], // star points
      ], color: 'rgba(200,180,255,0.5)' },
      // Simba sitting (far right)
      { points: [
        [92,30],[93,28],[94,26],[95,28],[96,30], // head
        [93,31],[92,34],[92,37],[93,38],[95,38],[96,37],[96,34],[95,31], // body
        [91,38],[90,39], // front paw
        [97,38],[98,39], // back paw
        [97,35],[99,34],[100,33], // tail
      ], color: 'rgba(255,200,100,0.4)' },
    ];

    constellations.forEach(c => {
      c.points.forEach(([x, y], i) => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = x + '%';
        star.style.top = y + '%';
        const size = (Math.random() * 1.5 + 2) + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.background = c.color;
        star.style.boxShadow = '0 0 4px ' + c.color;
        star.style.setProperty('--dur', (3 + Math.random() * 2) + 's');
        star.style.animationDelay = (i * 0.15) + 's';
        starsContainer.appendChild(star);
      });
    });

    // Generate fireflies
    for (let i = 0; i < 8; i++) {
      const ff = document.createElement('div');
      ff.className = 'firefly';
      ff.style.left = (20 + Math.random() * 60) + '%';
      ff.style.top = (40 + Math.random() * 40) + '%';
      ff.style.setProperty('--dur', (6 + Math.random() * 6) + 's');
      ff.style.animationDelay = (Math.random() * 8) + 's';
      document.body.appendChild(ff);
    }

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const errEl = document.getElementById('errorMsg');
      errEl.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Opening the gates...';

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
        // Magic burst animation then redirect
        const burst = document.createElement('div');
        burst.className = 'magic-burst';
        document.body.appendChild(burst);
        setTimeout(() => { window.location.href = '/dashboard'; }, 600);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '&#x2728; Enter the Kingdom';
      }
    });
  </script>
</body>
</html>`;

export default router;
