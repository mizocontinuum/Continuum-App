/**
 * Login & mock auth handler.
 *
 * Extracted verbatim from an inline <script> in login/index.html. Accepts the
 * two demo accounts (admin / student), plus any account registered through
 * /signup/ (stored in `continuum_registered_users`), then persists the session
 * in the exact shape every member page reads (store.js KEYS.session =
 * 'continuum.session').
 */

(function () {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('loginError');
  const toast = document.getElementById('loginToast');
  const demoAdminBtn = document.getElementById('demoAdminBtn');
  const demoStudentBtn = document.getElementById('demoStudentBtn');

  function showToast(text, isError = false) {
    if (!toast) return;
    toast.textContent = text;
    toast.className = 'toast-msg active' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.className = 'toast-msg';
    }, 3200);
  }

  // Persist the session in the exact shape every member page reads
  // (store.js KEYS.session = 'continuum.session'), so the top bar and the
  // auth guard recognise the user immediately after the redirect.
  function writeSession(role, name, email) {
    localStorage.setItem('continuum.session', JSON.stringify({
      id: null,
      name: name,
      email: email,
      role: role === 'admin' ? 'admin' : 'member'
    }));
    localStorage.setItem('continuum_auth_user', role);
  }

  // Quick-fill buttons
  if (demoAdminBtn && emailInput && passwordInput) {
    demoAdminBtn.addEventListener('click', function () {
      emailInput.value = 'admin@continuum.ph';
      passwordInput.value = 'admin123';
      if (errorMsg) errorMsg.textContent = '';
      showToast('Admin credentials filled!');
    });
  }

  if (demoStudentBtn && emailInput && passwordInput) {
    demoStudentBtn.addEventListener('click', function () {
      emailInput.value = 'student@continuum.ph';
      passwordInput.value = 'student123';
      if (errorMsg) errorMsg.textContent = '';
      showToast('Student credentials filled!');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = (emailInput.value || '').trim().toLowerCase();
      const pass = (passwordInput.value || '').trim();

      const submitBtn = document.getElementById('loginSubmit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
      }

      // Clear previous error
      if (errorMsg) errorMsg.textContent = '';

      // 1. Temporary Admin Account Check (accepts admin@continuum.ph or just admin, and admin123 or admin)
      if ((email === 'admin@continuum.ph' || email === 'admin') && (pass === 'admin123' || pass === 'admin')) {
        writeSession('admin', 'Executive Admin', 'admin@continuum.ph');
        showToast('Welcome Admin! Opening the dashboard...');
        setTimeout(() => {
          window.location.href = '../admin/';
        }, 600);
        return;
      }

      // 2. Temporary Student Account Check (accepts student@continuum.ph or student)
      if ((email === 'student@continuum.ph' || email === 'student') && (pass === 'student123' || pass === 'student')) {
        writeSession('student', 'Student Learner', 'student@continuum.ph');
        showToast('Login successful! Redirecting to Student Home...');
        setTimeout(() => {
          window.location.href = '../home/';
        }, 600);
        return;
      }

      // 2.1 Check newly registered user from /signup/ (Stored in continuum_registered_users)
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('continuum_registered_users') || '[]');
        const matchedUser = registeredUsers.find(u => u.email === email && u.password === pass);
        if (matchedUser) {
          writeSession(matchedUser.role || 'student', matchedUser.name || 'Executive Student', matchedUser.email);
          showToast(`Welcome ${matchedUser.name}! Logging in...`);
          setTimeout(() => {
            window.location.href = '../home/';
          }, 600);
          return;
        }
      } catch (e) {
        console.warn('Registered check error:', e);
      }

      // 3. Fallback invalid credentials
      setTimeout(() => {
        if (errorMsg) {
          errorMsg.textContent = 'Invalid email or password. Use demo credentials above.';
        }
        showToast('Invalid credentials', true);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
        }
      }, 400);
    });
  }
})();
