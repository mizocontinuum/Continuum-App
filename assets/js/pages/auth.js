/**
 * Continuum Academy - static auth screens.
 *
 * One module backs all four auth pages (login, signup, forgot-password and
 * reset-password). It wires whichever form is present to store.js - there is
 * no network request, no cookie, no CAPTCHA and no second factor. Signing in
 * simply records which demo account is active in this browser and moves on.
 */
import { setSession, roleForEmail, siteUrl, showToast } from '../store.js';

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

/** A readable display name for any address entered on the demo screens. */
function displayName(address) {
  const local = String(address).split('@')[0].toLowerCase();
  if (local.startsWith('admin')) return 'Continuum Administrator';
  if (local.startsWith('member')) return 'Continuum Member';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim() || 'Member';
}

/** Same-origin destination carried in ?redirect=<path>, else a fallback. */
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

  // One-tap demo accounts replace the old OAuth / magic-link buttons.
  document.querySelectorAll('[data-demo-email]').forEach((button) => {
    button.addEventListener('click', () => {
      email.value = button.dataset.demoEmail || '';
      password.value = 'continuum-demo';
      form.requestSubmit();
    });
  });

  form.addEventListener('submit', (event) => {
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

    if (submit) submit.disabled = true;

    const role = roleForEmail(address);
    setSession({ name: displayName(address), email: address, role });
    showToast(role === 'admin' ? 'Signed in as administrator.' : 'Welcome back.');

    window.location.href = nextPath(role === 'admin' ? siteUrl('admin/') : siteUrl('home/'));
  });
}

/* -------------------------------- signup -------------------------------- */

function initSignup() {
  const form = document.getElementById('signupForm');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const errorEl = document.getElementById('signupError');

  form.addEventListener('submit', (event) => {
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

    setSession({ name: fullName, email: address, role: roleForEmail(address) });
    showToast('Welcome to Continuum Academy.');
    window.location.href = siteUrl('home/');
  });
}

/* ---------------------------- forgot password --------------------------- */

function initForgot() {
  const form = document.getElementById('forgotForm');
  const email = document.getElementById('email');
  const errorEl = document.getElementById('forgotError');
  const sent = document.getElementById('forgotSent');
  const demoWrap = document.getElementById('demoResetWrap');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const address = email.value.trim();
    markInvalid(email, false);
    setError(errorEl, '');

    if (!EMAIL.test(address)) {
      markInvalid(email, true);
      setError(errorEl, 'Enter the email address on your account.');
      return;
    }

    // No mail is sent in the static build: reveal the confirmation and the
    // direct link into the reset screen so the flow can still be reviewed.
    form.hidden = true;
    if (sent) sent.hidden = false;
    if (demoWrap) demoWrap.hidden = false;
  });
}

/* ----------------------------- reset password --------------------------- */

function initReset() {
  const form = document.getElementById('resetForm');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const errorEl = document.getElementById('resetError');

  form.addEventListener('submit', (event) => {
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

    showToast('Password updated. Sign in with your new password.');
    window.location.href = siteUrl('login/');
  });
}
