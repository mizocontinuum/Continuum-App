/**
 * Reset password handler.
 *
 * Extracted verbatim from an inline <script> in reset-password/index.html.
 * Validates the new password locally and, since there is no backend recovery
 * token to post back, confirms locally and returns the user to sign in.
 */

(() => {
  'use strict';

  function showToast(msg, isError = false) {
    const toast = document.getElementById('resetToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast-msg show' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.className = 'toast-msg';
    }, 3200);
  }

  const form = document.getElementById('resetForm');
  const passInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');
  const errorMsg = document.getElementById('resetError');
  const submitBtn = document.getElementById('resetSubmit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const pass = (passInput.value || '').trim();
      const confirm = (confirmInput.value || '').trim();
      if (errorMsg) errorMsg.textContent = '';

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
        submitBtn.querySelector('span').textContent = 'Saving...';
      }

      // There is no backend recovery token to post back, so confirm locally
      // and send the user back to sign in with the new password.
      showToast('Password updated! Redirecting to sign in...');
      setTimeout(() => {
        window.location.href = '../login/';
      }, 900);
    });
  }
})();
