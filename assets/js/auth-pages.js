/**
 * Continuum Academy - Unified Auth Pages Controller
 * Consolidates Login, Signup, Forgot Password, and Reset Password logic
 * with shared helpers and zero code duplication.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  function showToast(msg, isError = false) {
    const el = $('loginToast') || $('signupToast') || $('forgotToast') || $('resetToast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast-msg show' + (isError ? ' error' : '');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      el.className = 'toast-msg';
    }, 2800);
  }
  window.toast = showToast;

  function bindPasswordToggle(btnId, inputId) {
    const btn = $(btnId);
    const input = $(inputId);
    if (!btn || !input) return;
    btn.onclick = function () {
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      this.textContent = isPw ? 'Hide' : 'Show';
      this.setAttribute('aria-label', isPw ? 'Hide password' : 'Show password');
    };
  }

  function setError(errEl, input, message) {
    if (errEl) errEl.textContent = message;
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clearErrorOnInput(inputs, errEl) {
    inputs.forEach((el) => {
      if (!el) return;
      if (errEl?.id) el.setAttribute('aria-describedby', errEl.id);
      el.addEventListener('input', () => {
        if (errEl) errEl.textContent = '';
        el.removeAttribute('aria-invalid');
      });
    });
  }

  function setButtonLoading(btn, isLoading, loadingText, defaultText) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.classList.toggle('loading', isLoading);
    const span = btn.querySelector('span');
    if (span) span.textContent = isLoading ? loadingText : defaultText;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const STORAGE = {
    users: 'continuum_registered_users',
    passwords: 'continuum_password_overrides',
    resets: 'continuum_reset_tokens'
  };

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function demoAccount(email) {
    if (email === 'admin@continuum.ph') {
      return { name: 'System Admin', email, role: 'admin', password: 'admin123' };
    }
    if (email === 'student@continuum.ph') {
      return { name: 'Continuum Student', email, role: 'member', password: 'student123' };
    }
    return null;
  }

  function safeRedirect(defaultPath, role = 'member') {
    const requested = new URLSearchParams(window.location.search).get('redirect');
    if (!requested) return defaultPath;
    try {
      const target = new URL(requested, window.location.href);
      const path = target.pathname;
      if (target.origin !== window.location.origin) return defaultPath;
      if (/\/(login|signup)\//.test(path)) return defaultPath;
      if (/\/admin\//.test(path) && role !== 'admin') return defaultPath;
      return target.pathname + target.search + target.hash;
    } catch (_) {
      return defaultPath;
    }
  }

  function createResetToken(email) {
    const now = Date.now();
    const tokens = readJson(STORAGE.resets, []).filter((item) =>
      Array.isArray(readJson(STORAGE.resets, [])) && item.expiresAt > now && item.email !== email
    );
    const bytes = new Uint8Array(32);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    tokens.push({ token, email, expiresAt: now + 60 * 60 * 1000 });
    writeJson(STORAGE.resets, tokens);
    return token;
  }

  function findResetToken(token) {
    if (!token) return null;
    const tokens = readJson(STORAGE.resets, []);
    const record = tokens.find((item) => item.token === token);
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      writeJson(STORAGE.resets, tokens.filter((item) => item.token !== token));
      return null;
    }
    return record;
  }

  function consumeResetToken(token) {
    const tokens = readJson(STORAGE.resets, []);
    writeJson(STORAGE.resets, tokens.filter((item) => item.token !== token));
  }

  // ── 1. LOGIN PAGE ──────────────────────────────────────────────────────────
  function initLogin() {
    const form = $('loginForm');
    const emailIn = $('loginEmail');
    const passIn = $('loginPassword');
    const err = $('loginError');
    const btn = $('loginSubmit');
    if (!form || !emailIn || !passIn) return;

    bindPasswordToggle('toggleLoginPass', 'loginPassword');
    clearErrorOnInput([emailIn, passIn], err);
    const emailParam = new URLSearchParams(window.location.search).get('email');
    if (emailParam && isValidEmail(emailParam)) emailIn.value = emailParam;

    const demoAdmin = $('demoAdminBtn');
    if (demoAdmin) {
      demoAdmin.onclick = () => {
        emailIn.value = 'admin@continuum.ph';
        passIn.value = 'admin123';
        showToast('Admin credentials filled');
      };
    }

    const demoStudent = $('demoStudentBtn');
    if (demoStudent) {
      demoStudent.onclick = () => {
        emailIn.value = 'student@continuum.ph';
        passIn.value = 'student123';
        showToast('Student credentials filled');
      };
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      if (err) err.textContent = '';
      const em = emailIn.value.trim().toLowerCase();
      const pw = passIn.value;

      if (!em) {
        setError(err, emailIn, 'Please enter your email address.');
        emailIn.focus();
        return;
      }
      if (!isValidEmail(em)) {
        setError(err, emailIn, 'Please enter a valid email address.');
        emailIn.focus();
        return;
      }
      if (!pw) {
        setError(err, passIn, 'Please enter your password.');
        passIn.focus();
        return;
      }

      setButtonLoading(btn, true, 'Signing In...', 'Sign In');

      setTimeout(() => {
        try {
          const registered = readJson(STORAGE.users, []);
          const overrides = readJson(STORAGE.passwords, {});
          const demo = demoAccount(em);
          const userMatch = registered.find((u) => u.email === em);
          const expectedPassword = demo ? (overrides[em] || demo.password) : userMatch?.password;

          if (expectedPassword && pw === expectedPassword) {
            const finalName = demo?.name || userMatch.name;
            const finalRole = demo?.role || 'member';
            localStorage.setItem('continuum.session', JSON.stringify({ name: finalName, email: em, role: finalRole }));
            localStorage.setItem('continuum_auth_user', finalRole);
            const destination = safeRedirect(finalRole === 'admin' ? '../admin/index.html' : '../home/index.html', finalRole);
            showToast('Sign in successful! Redirecting...');
            setTimeout(() => { window.location.href = destination; }, 800);
          } else {
            setError(err, passIn, 'Invalid email or password. Please verify your credentials.');
            passIn.focus();
            setButtonLoading(btn, false, 'Signing In...', 'Sign In');
          }
        } catch (_) {
          setError(err, null, 'Sign in is unavailable because browser storage is blocked.');
          setButtonLoading(btn, false, 'Signing In...', 'Sign In');
        }
      }, 750);
    };
  }

  // ── 2. SIGNUP PAGE ─────────────────────────────────────────────────────────
  function initSignup() {
    const form = $('signupForm');
    const nameIn = $('fullName');
    const emailIn = $('signupEmail');
    const roleIn = $('jobRole');
    const orgIn = $('organization');
    const passIn = $('signupPassword');
    const confIn = $('confirmPassword');
    const termsIn = $('termsCheck');
    const err = $('signupError');
    const btn = $('signupSubmitBtn');
    const strBar = $('strengthBar');
    const strLbl = $('passStrengthLabel');
    if (!form || !nameIn || !emailIn || !passIn) return;

    bindPasswordToggle('toggleSignupPass', 'signupPassword');
    bindPasswordToggle('toggleConfirmPass', 'confirmPassword');
    clearErrorOnInput([nameIn, emailIn, passIn, confIn], err);

    if (strBar && strLbl) {
      passIn.addEventListener('input', () => {
        const v = passIn.value;
        let score = 0;
        if (v.length >= 8) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;

        const levels = [
          { w: '0%', bg: '', text: 'Min. 8 characters', color: 'var(--text-muted)' },
          { w: '25%', bg: '#FF4D6D', text: 'Weak', color: '#FF4D6D' },
          { w: '50%', bg: '#FFAA00', text: 'Fair', color: '#FFAA00' },
          { w: '75%', bg: '#33B5FF', text: 'Good', color: '#33B5FF' },
          { w: '100%', bg: '#00E676', text: 'Strong', color: '#00E676' }
        ];
        const lvl = v.length === 0 ? levels[0] : levels[Math.min(score || 1, 4)];
        strBar.style.width = lvl.w;
        if (lvl.bg) strBar.style.background = lvl.bg;
        strLbl.textContent = lvl.text;
        strLbl.style.color = lvl.color;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (err) err.textContent = '';

      const nameVal = nameIn.value.trim();
      const emailVal = emailIn.value.trim().toLowerCase();
      const passVal = passIn.value.trim();
      const confVal = confIn ? confIn.value.trim() : passVal;
      const roleVal = roleIn ? roleIn.value : 'Student';
      const orgVal = orgIn ? orgIn.value.trim() : '';

      if (nameVal.length < 2) {
        if (err) err.textContent = 'Please provide your full legal name.';
        nameIn.setAttribute('aria-invalid', 'true');
        nameIn.focus();
        return;
      }
      if (!isValidEmail(emailVal)) {
        if (err) err.textContent = 'Please enter a valid work or personal email address.';
        emailIn.setAttribute('aria-invalid', 'true');
        emailIn.focus();
        return;
      }
      if (passVal.length < 8) {
        if (err) err.textContent = 'Password must be at least 8 characters.';
        passIn.setAttribute('aria-invalid', 'true');
        passIn.focus();
        return;
      }
      if (passVal !== confVal) {
        if (err) err.textContent = 'Passwords do not match.';
        if (confIn) {
          confIn.setAttribute('aria-invalid', 'true');
          confIn.focus();
        }
        return;
      }
      if (termsIn && !termsIn.checked) {
        if (err) err.textContent = 'Please accept the Continuum Terms of Service to continue.';
        termsIn.focus();
        return;
      }

      setButtonLoading(btn, true, 'Creating Account...', 'Create Account');

      try {
        const registered = JSON.parse(localStorage.getItem('continuum_registered_users') || '[]');
        if (registered.some((u) => u.email === emailVal)) {
          if (err) err.textContent = 'An account with this email already exists. Please sign in.';
          setButtonLoading(btn, false, 'Creating Account...', 'Create Account');
          return;
        }

        registered.push({
          name: nameVal,
          email: emailVal,
          role: roleVal,
          organization: orgVal,
          password: passVal,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('continuum_registered_users', JSON.stringify(registered));
        localStorage.setItem('continuum.session', JSON.stringify({
          id: 'USR-' + Date.now(),
          name: nameVal,
          email: emailVal,
          role: roleVal
        }));
        localStorage.setItem('continuum_auth_user', 'student');

        showToast('Account created successfully! Welcome to Continuum Academy.');
        setTimeout(() => { window.location.href = '../home/index.html'; }, 1100);
      } catch (ex) {
        console.error(ex);
        setButtonLoading(btn, false, 'Creating Account...', 'Create Account');
      }
    });
  }

  // ── 3. FORGOT PASSWORD PAGE ────────────────────────────────────────────────
  function initForgot() {
    const form = $('forgotForm');
    const emailIn = $('email');
    const err = $('forgotError');
    const sentNote = $('forgotSent');
    const btn = $('forgotSubmit');
    if (!form || !emailIn) return;

    clearErrorOnInput([emailIn], err);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailIn.value.trim().toLowerCase();
      if (err) err.textContent = '';

      if (!isValidEmail(email)) {
        if (err) err.textContent = 'Enter a valid email address.';
        showToast('Invalid email', true);
        return;
      }

      setButtonLoading(btn, true, 'Sending...', 'Send Reset Link');

      setTimeout(() => {
        form.style.display = 'none';
        if (sentNote) sentNote.hidden = false;
        showToast('Reset link sent to ' + email);
      }, 600);
    });
  }

  // ── 4. RESET PASSWORD PAGE ─────────────────────────────────────────────────
  function initReset() {
    const form = $('resetForm');
    const passIn = $('password');
    const confIn = $('confirm');
    const err = $('resetError');
    const btn = $('resetSubmit');
    if (!form || !passIn || !confIn) return;

    clearErrorOnInput([passIn, confIn], err);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = passIn.value.trim();
      const confirm = confIn.value.trim();
      if (err) err.textContent = '';

      if (pass.length < 8) {
        if (err) err.textContent = 'Password must be at least 8 characters.';
        showToast('Password too short', true);
        return;
      }
      if (pass !== confirm) {
        if (err) err.textContent = 'Passwords do not match.';
        showToast('Passwords do not match', true);
        return;
      }

      setButtonLoading(btn, true, 'Saving...', 'Save Password');
      showToast('Password updated! Redirecting to sign in...');
      setTimeout(() => { window.location.href = '../login/index.html'; }, 900);
    });
  }

  function renderSharedAuthChrome() {
    const container = document.querySelector('.login-container');
    const card = document.querySelector('.login-card');
    if (!container || !card) return;

    if (!container.querySelector('.brand-header')) {
      const header = document.createElement('header');
      header.className = 'brand-header';
      header.innerHTML = `
        <a href="../index.html" class="brand-link" aria-label="Continuum Academy Home">
          <img src="../assets/images/logo.png" alt="Continuum Academy Inc." class="brand-logo-full">
        </a>
        <div class="brand-divider"></div>
        <div class="powered-badge">
          <span class="powered-text">POWERED BY</span>
          <img src="../assets/images/mansmith.png" alt="Mansmith and Fielders, Inc." class="ms-logo">
        </div>`;
      container.insertBefore(header, container.firstChild);
    }

    if (!container.querySelector('.auth-showcase-panel')) {
      const showcase = document.createElement('div');
      showcase.className = 'auth-showcase-panel';
      showcase.innerHTML = `
        <div class="auth-spline-stage">
          <canvas id="authSplineCanvas" class="auth-spline-canvas"></canvas>
        </div>`;
      if (card.parentNode === container) {
        container.insertBefore(showcase, card);
      } else {
        card.parentNode.insertBefore(showcase, card);
      }
    }

    if (!container.querySelector('.login-footer')) {
      const footer = document.createElement('footer');
      footer.className = 'login-footer';
      footer.innerHTML = `
        <div class="footer-row">
          <a href="#" class="footer-link">Terms &amp; Conditions</a>
          <span class="dot">•</span>
          <a href="#" class="footer-link">Privacy Policy</a>
          <span class="dot">•</span>
          <a href="#" class="footer-link">Recurring Terms</a>
        </div>
        <div class="footer-row">
          <a href="#" class="footer-link">Refund Policy</a>
          <span class="dot">•</span>
          <a href="#" class="footer-link">Contact</a>
        </div>`;
      container.appendChild(footer);
    }

    container.style.opacity = '1';

    if (!document.getElementById('authStars')) {
      const c = document.createElement('canvas');
      c.id = 'authStars';
      c.className = 'auth-stars';
      c.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(c, document.body.firstChild);

      const ctx = c.getContext('2d');
      const dots = Array.from({ length: 90 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        r: 0.6 + Math.random() * 1.6,
        p: Math.random() * 6.28
      }));
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        c.width = window.innerWidth * dpr;
        c.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      window.addEventListener('resize', resize);
      resize();
      let t = 0;
      (function loop() {
        t += 0.025;
        const w = window.innerWidth, h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          d.x = (d.x + d.vx + 1) % 1;
          d.y = (d.y + d.vy + 1) % 1;
          const a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(t + d.p));
          ctx.fillStyle = `rgba(150, 220, 255, ${a.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        requestAnimationFrame(loop);
      })();
    }
  }

  renderSharedAuthChrome();
  initLogin();
  initSignup();
  initForgot();
  initReset();
})();
