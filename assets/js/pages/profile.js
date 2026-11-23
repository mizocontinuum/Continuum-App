/**
 * Continuum Academy - My Account (profile page).
 *
 * Everything here reads and writes the local store: there is no network, no
 * server and no cookie. The page is a thin view over store.js, so the data
 * survives reloads and still renders from the shipped defaults when storage
 * is unavailable.
 */
import {
  getSession,
  setSession,
  getProfile,
  saveProfile,
  getFavoriteIds,
  getProgressMap,
  watchedVideos,
  unreadCount,
  resetLocalData,
  showToast
} from '../store.js';
import { initPageChrome, paintSession } from '../user-menu.js?v=21';

/** A handful of common zones; Asia/Shanghai first so it is the demo default. */
const TIMEZONES = [
  'Asia/Shanghai',
  'Asia/Manila',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC'
];

document.addEventListener('DOMContentLoaded', async () => {
  const session = await initPageChrome();
  if (!session) return; // guard already redirected

  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const titleInput = document.getElementById('profileTitle');
  const companyInput = document.getElementById('profileCompany');
  const timezoneSelect = document.getElementById('profileTimezone');
  const errorEl = document.getElementById('profileError');
  const progressCount = document.getElementById('progressCount');

  /* ------------------------------ profile form ----------------------------- */

  timezoneSelect.replaceChildren(
    ...TIMEZONES.map((zone) => {
      const option = document.createElement('option');
      option.value = zone;
      option.textContent = zone;
      return option;
    })
  );

  function fillForm() {
    const profile = getProfile();
    nameInput.value = profile.full_name || '';
    emailInput.value = profile.email || '';
    titleInput.value = profile.title || '';
    companyInput.value = profile.company || '';
    timezoneSelect.value = TIMEZONES.includes(profile.timezone) ? profile.timezone : TIMEZONES[0];
  }

  function setError(message) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('show', Boolean(message));
  }

  fillForm();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();

    nameInput.classList.remove('invalid');
    emailInput.classList.remove('invalid');

    if (fullName.length < 2) {
      nameInput.classList.add('invalid');
      setError('Please enter a name with at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.classList.add('invalid');
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    try {
      saveProfile({
        full_name: fullName,
        email,
        title: titleInput.value.trim(),
        company: companyInput.value.trim(),
        timezone: timezoneSelect.value
      });
      paintSession(getSession());
      showToast('Profile saved.');
    } catch (err) {
      showToast(err.message || 'Could not save your profile.', true);
    }
  });

  /* ------------------------------ role toggle ------------------------------ */

  const roleMember = document.getElementById('roleMember');
  const roleAdmin = document.getElementById('roleAdmin');
  const roleButtons = [
    [roleMember, 'member'],
    [roleAdmin, 'admin']
  ];

  function paintRoleToggle() {
    const role = getSession()?.role === 'admin' ? 'admin' : 'member';
    roleButtons.forEach(([button, value]) => {
      if (!button) return;
      const active = value === role;
      button.classList.toggle('active', active);
      button.setAttribute('aria-checked', String(active));
    });
  }

  function switchRole(role) {
    const current = getSession() || {};
    setSession({ name: current.name, email: current.email, role });
    paintSession(getSession());
    paintRoleToggle();
    showToast(role === 'admin' ? 'Now previewing the Admin role.' : 'Now previewing the Member role.');
  }

  roleMember?.addEventListener('click', () => switchRole('member'));
  roleAdmin?.addEventListener('click', () => switchRole('admin'));
  paintRoleToggle();

  /* -------------------------------- activity ------------------------------- */

  function statCard(label, value) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const amount = document.createElement('span');
    amount.className = 'stat-value';
    amount.textContent = String(value);
    const caption = document.createElement('span');
    caption.className = 'stat-label';
    caption.textContent = label;
    card.append(amount, caption);
    return card;
  }

  function renderStats() {
    const host = document.getElementById('profileStats');
    if (!host) return;
    const minutes = Math.round(
      Object.values(getProgressMap()).reduce((sum, entry) => sum + (Number(entry?.position) || 0), 0) / 60
    );
    host.replaceChildren(
      statCard('In My List', getFavoriteIds().length),
      statCard('Completed', watchedVideos().length),
      statCard('Minutes watched', minutes),
      statCard('Unread alerts', unreadCount())
    );
  }

  function renderProgressCount() {
    if (!progressCount) return;
    const count = Object.keys(getProgressMap()).length;
    progressCount.textContent = `${count} title${count === 1 ? '' : 's'}`;
  }

  renderStats();
  renderProgressCount();

  /* ------------------------------- local data ------------------------------ */

  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    showToast('Password changes are disabled in the static demo.');
  });

  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Reset all local demo data? This clears your profile, My List, watch progress and notifications, and restores the shipped defaults.'
    );
    if (!confirmed) return;
    resetLocalData();
    window.location.reload();
  });
});
