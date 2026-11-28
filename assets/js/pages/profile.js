import { initPageChrome } from '../user-menu.js?v=6';
import { getProfile, saveProfile, showToast } from '../store.js?v=3';
import { esc } from './member-ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return;

  const app = document.getElementById('app');
  const profile = getProfile();
  const isAdmin = session.role === 'admin';

  app.innerHTML = `
    <div class="profile-card">
      <div class="avatar-big">${esc((profile.full_name || session.name || '?').trim().charAt(0).toUpperCase())}</div>
      <h1>${esc(profile.full_name || session.name || 'Member')}</h1>
      <p class="sub" style="margin-bottom:22px">${esc(profile.email || session.email || '')} · <b>${isAdmin ? 'Admin' : 'Member'}</b></p>

      <form id="profileForm">
        <div class="field">
          <label for="pfName">Full name</label>
          <input id="pfName" type="text" value="${esc(profile.full_name || session.name || '')}" maxlength="120" required>
        </div>
        <div class="field">
          <label for="pfEmail">Email</label>
          <input id="pfEmail" type="email" value="${esc(profile.email || session.email || '')}" disabled>
          <small style="color:#7fb4eb">Email changes require support — it is your sign-in identity.</small>
        </div>
        <div class="field">
          <label>Role</label>
          <input type="text" value="${isAdmin ? 'Administrator' : 'Member'}" disabled>
        </div>
        <button class="btn primary" type="submit">Save changes</button>
        ${isAdmin ? '<a class="btn ghost" href="../admin/index.html" style="margin-left:8px">Open Admin Studio</a>' : ''}
      </form>
    </div>`;

  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pfName').value.trim();
    if (name.length < 2) {
      showToast('Please enter your full name.', true);
      return;
    }
    saveProfile({ full_name: name });
    showToast('Profile updated.');
    setTimeout(() => location.reload(), 600);
  });
});
