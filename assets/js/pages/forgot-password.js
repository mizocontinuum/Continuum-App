/**
 * Forgot password handler.
 *
 * Extracted verbatim from an inline <script> in forgot-password/index.html.
 * Recovery is handled locally (there is no backend); we always report success
 * so we never reveal whether an account actually exists.
 */

(() => {
  'use strict';

  function showToast(msg, isError = false) {
    const toast = document.getElementById('forgotToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast-msg show' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.className = 'toast-msg';
    }, 3200);
  }

  const form = document.getElementById('forgotForm');
  const emailInput = document.getElementById('email');
  const errorMsg = document.getElementById('forgotError');
  const sentNote = document.getElementById('forgotSent');
  const submitBtn = document.getElementById('forgotSubmit');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = (emailInput.value || '').trim().toLowerCase();
      if (errorMsg) errorMsg.textContent = '';

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorMsg) errorMsg.textContent = 'Enter a valid email address.';
        showToast('Invalid email', true);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
        submitBtn.querySelector('span').textContent = 'Sending...';
      }

      // Recovery is handled locally (there is no backend). We always report
      // success so we never reveal whether an account actually exists.
      setTimeout(() => {
        form.style.display = 'none';
        if (sentNote) sentNote.hidden = false;
        showToast('Reset link sent to ' + email);
      }, 600);
    });
  }
})();
