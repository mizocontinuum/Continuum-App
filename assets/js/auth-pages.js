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

  function readUsers() {
    const stored = readJson(STORAGE.users, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter((user) => user && typeof user.email === 'string').map((user) => {
      const legacyRole = typeof user.role === 'string' && !['admin', 'member'].includes(user.role) ? user.role : '';
      return {
        ...user,
        role: user.role === 'admin' ? 'admin' : 'member',
        job_role: user.job_role || legacyRole
      };
    });
  }

  function readPasswords() {
    const stored = readJson(STORAGE.passwords, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  }

  function readResetTokens() {
    const stored = readJson(STORAGE.resets, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) =>
      item && typeof item.token === 'string' && typeof item.email === 'string' && Number.isFinite(item.expiresAt)
    );
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
      if (/\/(login|signup)(?:\/|$)/.test(path)) return defaultPath;
      if (/\/admin(?:\/|$)/.test(path) && role !== 'admin') return defaultPath;
      return target.pathname + target.search + target.hash;
    } catch (_) {
      return defaultPath;
    }
  }

  function currentDemoPassword(email) {
    return readPasswords()[email] || demoAccount(email)?.password;
  }

  function accountExists(email) {
    return Boolean(demoAccount(email) || readUsers().some((user) => user.email === email));
  }

  function invalidateSessionForEmail(email) {
    try {
      const session = readJson('continuum.session', null);
      if (session?.email !== email) return;
      localStorage.removeItem('continuum.session');
      localStorage.removeItem('continuum_auth_user');
      sessionStorage.removeItem('continuum_session');
      sessionStorage.removeItem('continuum_auth_user');
    } catch (_) {}
  }

  function createResetToken(email) {
    const now = Date.now();
    const tokens = readResetTokens().filter((item) => item.expiresAt > now && item.email !== email);
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
    const now = Date.now();
    const tokens = readResetTokens();
    const active = tokens.filter((item) => item.expiresAt > now);
    if (active.length !== tokens.length) {
      try { writeJson(STORAGE.resets, active); } catch (_) {}
    }
    return active.find((item) => item.token === token) || null;
  }

  function consumeResetToken(token) {
    const tokens = readResetTokens();
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
        passIn.value = currentDemoPassword(emailIn.value);
        showToast('Admin demo credentials filled');
      };
    }

    const demoStudent = $('demoStudentBtn');
    if (demoStudent) {
      demoStudent.onclick = () => {
        emailIn.value = 'student@continuum.ph';
        passIn.value = currentDemoPassword(emailIn.value);
        showToast('Student demo credentials filled');
      };
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      if (btn?.disabled) return;
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
          const registered = readUsers();
          const demo = demoAccount(em);
          const userMatch = registered.find((u) => u.email === em);
          const expectedPassword = demo ? currentDemoPassword(em) : userMatch?.password;

          if (expectedPassword && pw === expectedPassword) {
            const finalName = demo?.name || userMatch.name;
            const finalRole = demo?.role || 'member';
            writeJson('continuum.session', { name: finalName, email: em, role: finalRole });
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

    const params = new URLSearchParams(window.location.search);
    if (params.get('email') && isValidEmail(params.get('email'))) emailIn.value = params.get('email');

    if (termsIn) {
      termsIn.addEventListener('change', () => {
        if (termsIn.checked) {
          termsIn.removeAttribute('aria-invalid');
          if (err) err.textContent = '';
        }
      });
    }

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
      if (btn?.disabled) return;
      if (err) err.textContent = '';

      const nameVal = nameIn.value.trim();
      const emailVal = emailIn.value.trim().toLowerCase();
      const passVal = passIn.value;
      const confVal = confIn ? confIn.value : passVal;
      const jobRole = roleIn ? roleIn.value : 'Student / Fellow';
      const orgVal = orgIn ? orgIn.value.trim() : '';
      const plan = params.get('plan') || '';

      if (nameVal.length < 2) {
        setError(err, nameIn, 'Please provide your full legal name.');
        nameIn.focus();
        return;
      }
      if (!isValidEmail(emailVal)) {
        setError(err, emailIn, 'Please enter a valid work or personal email address.');
        emailIn.focus();
        return;
      }
      if (demoAccount(emailVal)) {
        setError(err, emailIn, 'This email is reserved for a demo account. Please use the sign-in screen.');
        emailIn.focus();
        return;
      }
      if (passVal.length < 8) {
        setError(err, passIn, 'Password must be at least 8 characters.');
        passIn.focus();
        return;
      }
      if (passVal !== confVal) {
        setError(err, confIn, 'Passwords do not match.');
        if (confIn) confIn.focus();
        return;
      }
      if (termsIn && !termsIn.checked) {
        setError(err, termsIn, 'Please accept the Continuum demo terms to continue.');
        termsIn.focus();
        return;
      }

      setButtonLoading(btn, true, 'Creating Account...', 'Create Account');

      try {
        const registered = readUsers();
        if (registered.some((user) => user.email === emailVal)) {
          setError(err, emailIn, 'An account with this email already exists. Please sign in.');
          setButtonLoading(btn, false, 'Creating Account...', 'Create Account');
          emailIn.focus();
          return;
        }

        registered.push({
          id: 'USR-' + Date.now(),
          name: nameVal,
          email: emailVal,
          role: 'member',
          job_role: jobRole,
          organization: orgVal,
          plan,
          password: passVal,
          createdAt: new Date().toISOString()
        });
        writeJson(STORAGE.users, registered);
        writeJson('continuum.session', { name: nameVal, email: emailVal, role: 'member', plan });
        localStorage.setItem('continuum_auth_user', 'member');

        showToast('Account created successfully! Welcome to Continuum Academy.');
        setTimeout(() => { window.location.href = safeRedirect('../home/index.html', 'member'); }, 1100);
      } catch (_) {
        setError(err, null, 'Account creation is unavailable because browser storage is blocked.');
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
    const resetLink = $('forgotResetLink');
    const btn = $('forgotSubmit');
    if (!form || !emailIn) return;

    clearErrorOnInput([emailIn], err);
    const emailParam = new URLSearchParams(window.location.search).get('email');
    if (emailParam && isValidEmail(emailParam)) emailIn.value = emailParam;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (btn?.disabled) return;
      const email = emailIn.value.trim().toLowerCase();
      if (err) err.textContent = '';

      if (!isValidEmail(email)) {
        setError(err, emailIn, 'Enter a valid email address.');
        showToast('Invalid email', true);
        emailIn.focus();
        return;
      }

      setButtonLoading(btn, true, 'Creating Link...', 'Create Reset Link');

      setTimeout(() => {
        try {
          if (!accountExists(email)) {
            setError(err, emailIn, 'No local demo account was found for that email.');
            setButtonLoading(btn, false, 'Creating Link...', 'Create Reset Link');
            emailIn.focus();
            return;
          }

          const token = createResetToken(email);
          const target = new URL('../reset-password/index.html', window.location.href);
          target.searchParams.set('token', token);
          target.searchParams.set('email', email);
          const redirect = new URLSearchParams(window.location.search).get('redirect');
          if (redirect) target.searchParams.set('redirect', redirect);
          if (resetLink) resetLink.href = target.href;
          form.hidden = true;
          if (sentNote) sentNote.hidden = false;
          showToast('Local reset link created for ' + email);
          resetLink?.focus();
        } catch (_) {
          setError(err, null, 'A reset link cannot be created because browser storage is blocked.');
          setButtonLoading(btn, false, 'Creating Link...', 'Create Reset Link');
        }
      }, 600);
    });
  }

  // ── 4. RESET PASSWORD PAGE ─────────────────────────────────────────────────
  function initReset() {
    const form = $('resetForm');
    const passIn = $('password');
    const confIn = $('confirm');
    const err = $('resetError');
    const expired = $('resetExpired');
    const btn = $('resetSubmit');
    if (!form || !passIn || !confIn) return;

    bindPasswordToggle('toggleResetPass', 'password');
    bindPasswordToggle('toggleResetConfirm', 'confirm');
    clearErrorOnInput([passIn, confIn], err);
    const token = new URLSearchParams(window.location.search).get('token');

    const rejectInvalidLink = () => {
      form.hidden = true;
      if (expired) {
        expired.hidden = false;
        expired.setAttribute('tabindex', '-1');
        expired.focus();
      }
    };

    if (!findResetToken(token)) rejectInvalidLink();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (btn?.disabled) return;
      if (err) err.textContent = '';

      const record = findResetToken(token);
      if (!record || !accountExists(record.email)) {
        rejectInvalidLink();
        return;
      }

      const pass = passIn.value;
      const confirm = confIn.value;
      if (pass.length < 8) {
        setError(err, passIn, 'Password must be at least 8 characters.');
        showToast('Password too short', true);
        passIn.focus();
        return;
      }
      if (pass !== confirm) {
        setError(err, confIn, 'Passwords do not match.');
        showToast('Passwords do not match', true);
        confIn.focus();
        return;
      }

      setButtonLoading(btn, true, 'Saving...', 'Save Password');

      try {
        if (demoAccount(record.email)) {
          const overrides = readPasswords();
          overrides[record.email] = pass;
          writeJson(STORAGE.passwords, overrides);
        } else {
          const users = readUsers();
          const user = users.find((item) => item.email === record.email);
          if (!user) {
            rejectInvalidLink();
            return;
          }
          user.password = pass;
          writeJson(STORAGE.users, users);
        }

        invalidateSessionForEmail(record.email);
        consumeResetToken(token);
        showToast('Password updated! Redirecting to sign in...');
        setTimeout(() => {
          window.location.href = '../login/index.html?email=' + encodeURIComponent(record.email);
        }, 900);
      } catch (_) {
        setError(err, null, 'The password could not be saved because browser storage is blocked.');
        setButtonLoading(btn, false, 'Saving...', 'Save Password');
      }
    });
  }

  function initLegalDialog() {
    const content = {
      terms: {
        title: 'Continuum demo terms',
        body: 'This site is a frontend demonstration. Accounts and learning progress are stored only in this browser. No paid service, subscription, or formal service agreement is activated by creating an account.'
      },
      privacy: {
        title: 'Local demo privacy notice',
        body: 'This demo does not send your name, email, password, or learning activity to a server. Browser storage can be cleared through your browser settings. Production privacy and data-retention policies must be configured before launch.'
      },
      recurring: {
        title: 'Recurring billing demo notice',
        body: 'No payment method is collected and no recurring charge is created. Pricing shown on the landing page is illustrative until a payment provider and billing terms are connected.'
      },
      refund: {
        title: 'Refund policy demo notice',
        body: 'No purchase or charge is made in this frontend demo, so there is no payment to refund. A formal refund policy must be supplied before paid plans launch.'
      },
      contact: {
        title: 'Contact',
        body: 'A support inbox or contact endpoint is not connected to this demo. Add verified support details before publishing the site.'
      }
    };
    const dialog = document.createElement('dialog');
    dialog.className = 'legal-dialog';
    dialog.setAttribute('aria-labelledby', 'legalDialogTitle');
    dialog.innerHTML = `
      <h2 id="legalDialogTitle"></h2>
      <p id="legalDialogBody"></p>
      <button type="button" class="legal-dialog-close">Close</button>`;
    document.body.appendChild(dialog);

    document.querySelectorAll('[data-legal]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = content[button.dataset.legal];
        if (!item) return;
        dialog.querySelector('h2').textContent = item.title;
        dialog.querySelector('p').textContent = item.body;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      });
    });

    dialog.querySelector('.legal-dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
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
          <button type="button" class="footer-link" data-legal="terms">Terms &amp; Conditions</button>
          <span class="dot">•</span>
          <button type="button" class="footer-link" data-legal="privacy">Privacy Policy</button>
          <span class="dot">•</span>
          <button type="button" class="footer-link" data-legal="recurring">Recurring Terms</button>
        </div>
        <div class="footer-row">
          <button type="button" class="footer-link" data-legal="refund">Refund Policy</button>
          <span class="dot">•</span>
          <button type="button" class="footer-link" data-legal="contact">Contact</button>
        </div>`;
      container.appendChild(footer);
    }

    initLegalDialog();
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
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      (function loop() {
        t += still ? 0 : 0.025;
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
        if (!still) requestAnimationFrame(loop);
      })();
    }
  }

  renderSharedAuthChrome();
  initLogin();
  initSignup();
  initForgot();
  initReset();
})();
