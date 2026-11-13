/**
 * Continuum Academy - authentication screens.
 *
 * One module backs all four auth pages (login, signup, forgot-password and
 * reset-password). Unlike the old static build, every action here talks to the
 * real backend:
 *
 *   login           -> POST /api/auth/login          (sets HttpOnly cookies)
 *   signup          -> POST /api/auth/signup
 *   social sign-in  -> POST /api/auth/oauth          (then the provider URL)
 *   forgot          -> POST /api/auth/forgot
 *   reset           -> POST /api/auth/adopt-session  (from the recovery link)
 *                      POST /api/auth/update-password
 *
 * Tokens never reach this code: the server keeps the session in HttpOnly
 * cookies, and store.js only mirrors the public user for painting the UI.
 */
import { cacheSession, siteUrl, showToast } from '../store.js';
import { api } from '../api.js';
import { captchaEnabled, mountCaptcha } from '../captcha.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener('DOMContentLoaded', init);

function init() {
  if (document.getElementById('loginForm')) initLogin();
  if (document.getElementById('signupForm')) initSignup();
  if (document.getElementById('forgotForm')) initForgot();
  if (document.getElementById('resetForm')) initReset();
}

/* ------------------------------- helpers -------------------------------- */

function setError(el, message) {
  if (!el) return;
  el.textContent = message || '';
  el.classList.toggle('show', Boolean(message));
}

function markInvalid(input, invalid) {
  if (input) input.classList.toggle('invalid', Boolean(invalid));
}

/** Lock a submit control while a request is in flight. */
function setBusy(button, busy) {
  if (!button) return;
  button.disabled = Boolean(busy);
  button.setAttribute('aria-busy', busy ? 'true' : 'false');
}

/** A safe same-origin destination from ?redirect=<path>, else a fallback. */
function nextPath(fallback) {
  const raw = new URLSearchParams(window.location.search).get('redirect');
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return fallback;
}

/* -------------------------------- login --------------------------------- */

function initLogin() {
  const form = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const errorEl = document.getElementById('loginError');
  const submit = form.querySelector('.btn-submit');
  const captcha = mountCaptcha(document.getElementById('turnstileSlot'));

  // Second step, only reached when the account has a verified 2FA factor.
  const mfaForm = document.getElementById('mfaForm');
  const mfaCode = document.getElementById('mfaCode');
  const mfaError = document.getElementById('mfaError');
  const mfaSubmit = document.getElementById('mfaSubmit');
  let pendingFactorId = null;

  /** Swap the credential form for the authenticator step. */
  function startMfa(factorId) {
    pendingFactorId = factorId || null;
    form.hidden = true;
    const alt = document.getElementById('altOptions');
    if (alt) alt.hidden = true;
    const signupHint = document.querySelector('.signup-hint');
    if (signupHint) signupHint.hidden = true;
    if (mfaForm) {
      mfaForm.hidden = false;
      mfaCode?.focus();
    }
  }

  // Surface ?error= from the OAuth callback (e.g. "sign-in session expired").
  const queryError = new URLSearchParams(window.location.search).get('error');
  if (queryError) setError(errorEl, queryError);

  // Social sign-in: ask the server for the provider URL, then navigate.
  document.querySelectorAll('[data-provider]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.dataset.busy === 'true') return;
      button.dataset.busy = 'true';
      button.disabled = true;
      try {
        const { url } = await api.oauth(button.dataset.provider, nextPath('/home/'));
        window.location.href = url;
      } catch (error) {
        button.dataset.busy = 'false';
        button.disabled = false;
        setError(errorEl, error.message);
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const address = email.value.trim();
    setError(errorEl, '');
    markInvalid(email, false);
    markInvalid(password, false);

    if (!EMAIL.test(address)) {
      markInvalid(email, true);
      setError(errorEl, 'Enter a valid email address.');
      return;
    }
    if (!password.value) {
      markInvalid(password, true);
      setError(errorEl, 'Enter your password.');
      return;
    }

    setBusy(submit, true);
    const widget = await captcha;

    if (captchaEnabled() && !widget?.getToken()) {
      setError(errorEl, 'Please complete the verification challenge.');
      setBusy(submit, false);
      return;
    }

    try {
      const data = await api.login(address, password.value, widget ? widget.getToken() : '');

      // 2FA: the server held a short-lived aal1 token and wants a code next.
      if (data?.mfaRequired) {
        setBusy(submit, false);
        startMfa(data.factorId);
        return;
      }

      cacheSession(data?.user || null);
      showToast('Welcome back.');
      window.location.href = nextPath(data?.user?.role === 'admin' ? siteUrl('admin/') : siteUrl('home/'));
    } catch (error) {
      widget?.reset();
      setError(errorEl, error.message);
      setBusy(submit, false);
    }
  });

  /* ------------------------- verify the 2FA code -------------------------- */

  if (mfaForm && mfaCode) {
    mfaForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const code = mfaCode.value.trim();
      setError(mfaError, '');
      markInvalid(mfaCode, false);

      if (!/^\d{6}$/.test(code)) {
        markInvalid(mfaCode, true);
        setError(mfaError, 'Enter the 6-digit code from your authenticator app.');
        return;
      }

      setBusy(mfaSubmit, true);
      try {
        const data = await api.mfaVerify(code, pendingFactorId);
        cacheSession(data?.user || null);
        showToast('Welcome back.');
        window.location.href = nextPath(data?.user?.role === 'admin' ? siteUrl('admin/') : siteUrl('home/'));
      } catch (error) {
        setError(mfaError, error.message);
        setBusy(mfaSubmit, false);
      }
    });
  }
}

/* -------------------------------- signup -------------------------------- */

function initSignup() {
  const form = document.getElementById('signupForm');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const errorEl = document.getElementById('signupError');
  const sent = document.getElementById('signupSent');
  const submit = document.getElementById('signupSubmit') || form.querySelector('.btn-submit');
  const captcha = mountCaptcha(document.getElementById('turnstileSlot'));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = name.value.trim();
    const address = email.value.trim();
    [name, email, password, confirm].forEach((input) => markInvalid(input, false));
    setError(errorEl, '');

    if (fullName.length < 2) {
      markInvalid(name, true);
      setError(errorEl, 'Please enter your full name.');
      return;
    }
    if (!EMAIL.test(address)) {
      markInvalid(email, true);
      setError(errorEl, 'Enter a valid email address.');
      return;
    }
    if (password.value.length < 8) {
      markInvalid(password, true);
      setError(errorEl, 'Use a password of at least 8 characters.');
      return;
    }
    if (password.value !== confirm.value) {
      markInvalid(confirm, true);
      setError(errorEl, 'The two passwords do not match.');
      return;
    }

    setBusy(submit, true);
    const widget = await captcha;

    if (captchaEnabled() && !widget?.getToken()) {
      setError(errorEl, 'Please complete the verification challenge.');
      setBusy(submit, false);
      return;
    }

    try {
      const data = await api.signup(address, password.value, fullName, widget ? widget.getToken() : '');

      // Email confirmation on: no session yet, so point at the inbox instead.
      if (data?.needsEmailConfirmation) {
        form.hidden = true;
        if (sent) sent.hidden = false;
        return;
      }

      cacheSession(data?.user || null);
      showToast('Welcome to Continuum Academy.');
      window.location.href = siteUrl('home/');
    } catch (error) {
      widget?.reset();
      setError(errorEl, error.message);
      setBusy(submit, false);
    }
  });
}

/* ---------------------------- forgot password --------------------------- */

function initForgot() {
  const form = document.getElementById('forgotForm');
  const email = document.getElementById('email');
  const errorEl = document.getElementById('forgotError');
  const sent = document.getElementById('forgotSent');
  const submit = document.getElementById('forgotSubmit') || form.querySelector('.btn-submit');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const address = email.value.trim();
    markInvalid(email, false);
    setError(errorEl, '');

    if (!EMAIL.test(address)) {
      markInvalid(email, true);
      setError(errorEl, 'Enter the email address on your account.');
      return;
    }

    setBusy(submit, true);
    try {
      await api.forgot(address);
    } catch (error) {
      // The API answers 200 for any known/unknown address on purpose. Only a
      // network failure or a rate limit is worth surfacing.
      if (error?.status === 0 || error?.status === 429) {
        setError(errorEl, error.message);
        setBusy(submit, false);
        return;
      }
    }

    form.hidden = true;
    if (sent) sent.hidden = false;
  });
}

/* ----------------------------- reset password --------------------------- */

function initReset() {
  const form = document.getElementById('resetForm');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const errorEl = document.getElementById('resetError');
  const expired = document.getElementById('resetExpired');
  const submit = document.getElementById('resetSubmit') || form.querySelector('.btn-submit');

  // Only reveal the form once the recovery link has established a session.
  adoptRecoverySession().then((ready) => {
    if (!ready) {
      form.hidden = true;
      if (expired) expired.hidden = false;
      return;
    }
    wireResetForm();
  });

  function wireResetForm() {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      markInvalid(password, false);
      markInvalid(confirm, false);
      setError(errorEl, '');

      if (password.value.length < 8) {
        markInvalid(password, true);
        setError(errorEl, 'Use a password of at least 8 characters.');
        return;
      }
      if (password.value !== confirm.value) {
        markInvalid(confirm, true);
        setError(errorEl, 'The two passwords do not match.');
        return;
      }

      setBusy(submit, true);
      try {
        await api.updatePassword(password.value);
        showToast('Password updated. Sign in with your new password.');
        window.location.href = siteUrl('login/');
      } catch (error) {
        setBusy(submit, false);
        if (error?.status === 401) {
          // The recovery session lapsed between load and submit.
          form.hidden = true;
          setError(errorEl, '');
          if (expired) expired.hidden = false;
          return;
        }
        setError(errorEl, error.message);
      }
    });
  }
}

/**
 * The password-recovery email returns tokens in the URL fragment. Hand them to
 * the server once (so they become HttpOnly cookies), then strip them from the
 * address bar. When there is no fragment, fall back to any existing session,
 * which covers a plain reload or a code-flow callback.
 * @returns {Promise<boolean>} true when a recovery session is in place
 */
async function adoptRecoverySession() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');

  if (accessToken) {
    try {
      const data = await api.adoptSession(accessToken, hash.get('refresh_token') || undefined);
      cacheSession(data?.user || null);
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const data = await api.getSession();
    cacheSession(data?.user || null);
    return true;
  } catch {
    return false;
  }
}
