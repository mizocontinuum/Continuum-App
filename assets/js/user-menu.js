/**
 * Continuum Academy - shared page chrome.
 *
 * One module for everything that appears in every top bar:
 *   initPageChrome()       - server-verified session gate + fills in the account details
 *   initUserMenu()         - avatar dropdown (Account, My Library, Admin, Sign out)
 *   initNotificationBell() - bell button + drawer, fed by store.js
 *
 * The session is verified against GET /api/auth/session; the local cache in
 * store.js is only a mirror used to paint the chrome. The catalogue and the
 * bell still read from the static mock data.
 */

import {
  getSession,
  cacheSession,
  signOut,
  siteUrl,
  isAdmin,
  listNotifications,
  markAllRead,
  formatWhen
} from './store.js';
import { api } from './api.js';

/* ------------------------------ page chrome ------------------------------ */

/**
 * Call once per page, after DOMContentLoaded, and await the result.
 * Enforces `data-requires-auth` / `data-requires-admin` on <html> against the
 * server, then fills every [data-session-*] placeholder and wires [data-logout].
 * @returns {Promise<object|null>} the session when the page may render
 */
export async function initPageChrome() {
  const root = document.documentElement;
  const gated = root.hasAttribute('data-requires-auth');
  const adminOnly = root.hasAttribute('data-requires-admin');

  const session = await resolveServerSession();

  if (gated) {
    if (!session) {
      redirectToLogin();
      return null;
    }
    if (adminOnly && session.role !== 'admin') {
      window.location.replace(siteUrl('home/'));
      return null;
    }
  }

  paintSession(session);
  wireLogoutButtons();
  initUserMenu(session);
  initScrollNav();
  return session;
}

/* /* nav-update */ Auto-hide bottom nav on scroll down, reveal on scroll up (mobile only) */
function initScrollNav() {
  const nav = document.querySelector('.bottom-nav-container');
  if (!nav || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (window.innerWidth > 760) return;
    const curY = window.scrollY;
    const diff = curY - lastY;
    if (curY > 80 && diff > 10) {
      nav.classList.add('nav-hidden');
    } else if (diff < -10 || curY <= 40) {
      nav.classList.remove('nav-hidden');
    }
    lastY = curY;
  }, { passive: true });
}

/**
 * Ask the server who is signed in, mirroring the answer into the local cache.
 * A 401 is definitive (signed out). Any other failure (offline, cold start)
 * falls back to the cached mirror so a transient blip does not sign the user
 * out - the Edge middleware remains the authoritative gate in production.
 */
async function resolveServerSession() {
  try {
    const data = await api.getSession();
    return cacheSession(data?.user || null);
  } catch (error) {
    if (error?.status === 401) {
      cacheSession(null);
      return null;
    }
    return getSession();
  }
}

function redirectToLogin() {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.replace(siteUrl(`login/?redirect=${next}`));
}

/** Paint the signed-in name / email / initial / role into the page. */
export function paintSession(session = getSession()) {
  const name = session?.name || 'Guest';
  const email = session?.email || '';
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  const admin = session?.role === 'admin';

  document.querySelectorAll('[data-session-name], [data-user-name]').forEach((el) => {
    el.textContent = name;
  });
  document.querySelectorAll('[data-session-email]').forEach((el) => {
    el.textContent = email;
  });
  document.querySelectorAll('[data-session-initial]').forEach((el) => {
    el.textContent = initial;
  });
  document.querySelectorAll('[data-session-role]').forEach((el) => {
    el.textContent = admin ? 'Admin' : 'Member';
  });
  document.querySelectorAll('[data-demo-chip]').forEach((chip) => {
    chip.textContent = admin ? 'Admin' : 'Member';
  });

  document.querySelectorAll('.admin-only-link').forEach((el) => {
    el.hidden = !admin;
  });

  document.querySelectorAll('[data-admin-only]').forEach((el) => {
    el.hidden = !admin;
  });
}

function wireLogoutButtons() {
  document
    .querySelectorAll('[data-logout], [data-action="logout"], #logoutBtn, .btn-logout')
    .forEach((btn) => {
      if (btn.dataset.logoutWired === 'true') return;
      btn.dataset.logoutWired = 'true';
      btn.addEventListener('click', async (event) => {
        event.preventDefault();
        if (btn.dataset.busy === 'true') return;
        // Lock the control so a double-tap cannot fire two sign-out round-trips.
        btn.dataset.busy = 'true';
        btn.disabled = true;
        await signOut();
      });
    });
}

/* ------------------------------- user menu ------------------------------- */

/**
 * Avatar dropdown, built once per page.
 * @param {object|null} session - already-resolved session from initPageChrome()
 */
export function initUserMenu(session = getSession()) {
  initNotificationBell();

  const profileBtn = document.getElementById('profileBtn');
  if (!profileBtn) return;

  const topActions = profileBtn.closest('.top-actions');
  if (!topActions) return;

  topActions.classList.add('has-user-menu');

  let menuPanel = topActions.querySelector('.user-menu-panel');
  if (!menuPanel) {
    menuPanel = document.createElement('div');
    menuPanel.className = 'user-menu-panel';
    menuPanel.setAttribute('role', 'menu');
    menuPanel.setAttribute('aria-hidden', 'true');
    menuPanel.innerHTML = `
      <div class="user-menu-header">
        <div class="user-menu-name" data-session-name></div>
        <div class="user-menu-email" data-session-email></div>
      </div>
      <div class="user-menu-list">
        <a class="user-menu-item tint-teal" role="menuitem" data-menu-link="profile">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Account & Profile</span>
        </a>
        <a class="user-menu-item tint-purple" role="menuitem" data-menu-link="library">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>My Library</span>
        </a>
        <a class="user-menu-item tint-yellow admin-only-link" role="menuitem" hidden data-menu-link="admin">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Admin Portal</span>
        </a>
        <div class="user-menu-divider"></div>
        <button type="button" class="user-menu-item tint-red" data-logout role="menuitem">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    `;
    topActions.appendChild(menuPanel);
  }

  // Relative destinations, so the menu works from any page and any host path.
  menuPanel.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.setAttribute('href', siteUrl(`${link.dataset.menuLink}/`));
  });

  paintSession(session);
  wireLogoutButtons();

  const openMenu = () => {
    menuPanel.classList.add('open');
    menuPanel.setAttribute('aria-hidden', 'false');
    profileBtn.classList.add('menu-active');
    profileBtn.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    menuPanel.classList.remove('open');
    menuPanel.setAttribute('aria-hidden', 'true');
    profileBtn.classList.remove('menu-active');
    profileBtn.setAttribute('aria-expanded', 'false');
  };

  profileBtn.setAttribute('aria-haspopup', 'menu');
  profileBtn.setAttribute('aria-expanded', 'false');
  profileBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menuPanel.classList.contains('open')) closeMenu();
    else openMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menuPanel.contains(event.target) && !profileBtn.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuPanel.classList.contains('open')) {
      closeMenu();
      profileBtn.focus();
    }
  });

  // Highlight the current page's entry.
  const path = window.location.pathname;
  menuPanel.querySelectorAll('[data-menu-link]').forEach((link) => {
    if (path.includes(`/${link.dataset.menuLink}/`)) link.classList.add('active');
  });
}

/* --------------------------- notification bell --------------------------- */

/** Wire #bellBtn (present in every top bar) to the static notification feed. */
export function initNotificationBell() {
  const bellBtn = document.getElementById('bellBtn');
  if (!bellBtn) return;

  const topActions = bellBtn.closest('.top-actions');
  if (!topActions) return;

  topActions.classList.add('has-user-menu');

  let badge = bellBtn.querySelector('.bell-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'bell-badge';
    badge.hidden = true;
    bellBtn.append(badge);
  }

  let panel = topActions.querySelector('.notif-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notifications');
    panel.setAttribute('aria-hidden', 'true');

    const head = document.createElement('div');
    head.className = 'notif-head';
    head.textContent = 'Notifications';

    const list = document.createElement('div');
    list.className = 'notif-list';

    const empty = document.createElement('p');
    empty.className = 'notif-empty';
    empty.textContent = "You're all caught up.";

    panel.append(head, list, empty);
    topActions.append(panel);
  }

  const list = panel.querySelector('.notif-list');
  const empty = panel.querySelector('.notif-empty');

  const setBadge = (count) => {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = count <= 0;
    bellBtn.setAttribute('aria-label', count > 0 ? `Notifications, ${count} unread` : 'Notifications');
  };

  const render = () => {
    const items = listNotifications();
    if (!items.length) {
      list.replaceChildren();
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    list.replaceChildren(...items.map(notificationRow));
  };

  const open = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  bellBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (panel.classList.contains('open')) {
      close();
      return;
    }
    open();
    render();
    markAllRead();
    setBadge(0);
  });

  document.addEventListener('click', (event) => {
    if (!panel.contains(event.target) && !bellBtn.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) {
      close();
      bellBtn.focus();
    }
  });

  render();
  setBadge(isAdmin() ? 0 : listNotifications().filter((item) => !item.read).length);
}

function notificationRow(item) {
  const row = document.createElement('div');
  row.className = item.read ? 'notif-item' : 'notif-item unread';

  const title = document.createElement('div');
  title.className = 'notif-title';
  title.textContent = item.title || 'Notification';

  const body = document.createElement('div');
  body.className = 'notif-body';
  body.textContent = item.body || '';

  const time = document.createElement('div');
  time.className = 'notif-time';
  time.textContent = formatWhen(item.created_at);

  row.append(title, body, time);
  return row;
}
