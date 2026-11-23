/**
 * Client-side registration & immediate auto-login.
 *
 * Extracted verbatim from an inline <script> in signup/index.html. Registers
 * the account in `continuum_registered_users`, then issues an automatic student
 * session in the shape every member page reads (store.js KEYS.session =
 * 'continuum.session') and redirects to the Student Portal (/home/).
 */

(() => {
  'use strict';

  function showToast(msg, isError = false) {
    const toast = document.getElementById('signupToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast-msg show' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.className = 'toast-msg';
    }, 3200);
  }

  const form = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');
  const errorMsg = document.getElementById('signupError');
  const submitBtn = document.getElementById('signupSubmit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (nameInput.value || '').trim();
      const email = (emailInput.value || '').trim().toLowerCase();
      const pass = (passInput.value || '').trim();
      const confirm = (confirmInput.value || '').trim();

      if (errorMsg) errorMsg.textContent = '';

      // Validation
      if (!name || name.length < 2) {
        if (errorMsg) errorMsg.textContent = 'Please provide your full legal name.';
        showToast('Invalid name', true);
        return;
      }

      if (pass.length < 8) {
        if (errorMsg) errorMsg.textContent = 'Password must be at least 8 characters.';
        showToast('Password too short', true);
        return;
      }

      if (pass !== confirm) {
        if (errorMsg) errorMsg.textContent = 'Passwords do not match.';
        showToast('Passwords do not match', true);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
        submitBtn.querySelector('span').textContent = 'Creating Account...';
      }

      // Register in localStorage student users list
      try {
        let registeredUsers = JSON.parse(localStorage.getItem('continuum_registered_users') || '[]');
        const existing = registeredUsers.find(u => u.email === email);
        if (existing) {
          if (errorMsg) errorMsg.textContent = 'An account with this email already exists. Please sign in.';
          showToast('Account already exists', true);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '';
            submitBtn.querySelector('span').textContent = 'Create Account';
          }
          return;
        }

        registeredUsers.push({
          name: name,
          email: email,
          password: pass,
          role: 'student',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('continuum_registered_users', JSON.stringify(registeredUsers));
      } catch (err) {
        console.warn('Registration save err:', err);
      }

      // Issue automatic student session & redirect to Student Portal (/home/).
      // Written in the shape every member page reads (store.js
      // KEYS.session = 'continuum.session') so the top bar and auth guard
      // recognise the new account right away.
      localStorage.setItem('continuum.session', JSON.stringify({
        id: null,
        name: name,
        email: email,
        role: 'member'
      }));
      localStorage.setItem('continuum_auth_user', 'student');

      showToast('Account created successfully! Welcome to the Academy...');
      setTimeout(() => {
        window.location.href = '../home/';
      }, 700);
    });
  }
})();
