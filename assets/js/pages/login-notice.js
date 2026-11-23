/**
 * Login notice banner.
 *
 * Shows the academy advisory dispatched from the admin dashboard, read from
 * `continuum_active_student_notice` in localStorage. Extracted from an inline
 * <script> in home/index.html so the document body stays script-free and the
 * banner styling lives in the stylesheet instead of inline style attributes.
 */

const STORAGE_KEY = 'continuum_active_student_notice';

function buildBanner(notice) {
  const banner = document.createElement('div');
  banner.id = 'studentLoginNoticeBanner';
  banner.className = 'notice-banner';
  banner.setAttribute('role', 'status');

  const head = document.createElement('div');
  head.className = 'notice-banner-head';

  const title = document.createElement('div');
  title.className = 'notice-banner-title';

  const badge = document.createElement('span');
  badge.className = 'notice-banner-badge';
  badge.textContent = 'Academy Advisory';

  const heading = document.createElement('h4');
  heading.textContent = notice.subject || 'New Message from Administration';

  title.append(badge, heading);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'btnCloseNoticeBanner';
  closeBtn.className = 'notice-banner-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss notice');
  closeBtn.textContent = '\u00d7';

  head.append(title, closeBtn);

  const body = document.createElement('p');
  body.className = 'notice-banner-body';
  body.textContent = notice.body || '';

  const foot = document.createElement('div');
  foot.className = 'notice-banner-foot';

  const dismissBtn = document.createElement('button');
  dismissBtn.id = 'btnDismissNotice';
  dismissBtn.className = 'notice-banner-cta';
  dismissBtn.type = 'button';
  dismissBtn.textContent = 'Acknowledge & Close';

  foot.append(dismissBtn);

  banner.append(head, body, foot);
  return banner;
}

function dismissBanner(banner, notice) {
  banner.classList.add('notice-banner-hide');
  notice.unread = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notice));
  } catch (err) {
    console.warn('Notice banner: could not persist dismissal', err);
  }
  window.setTimeout(() => {
    if (banner.parentNode) banner.parentNode.removeChild(banner);
  }, 320);
}

export function initLoginNotice() {
  let notice;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.unread) return;
    notice = parsed;
  } catch (err) {
    console.warn('Notice banner error:', err);
    return;
  }

  const banner = buildBanner(notice);
  document.body.appendChild(banner);

  const handleDismiss = () => dismissBanner(banner, notice);
  const closeBtn = banner.querySelector('#btnCloseNoticeBanner');
  const dismissBtn = banner.querySelector('#btnDismissNotice');
  if (closeBtn) closeBtn.addEventListener('click', handleDismiss);
  if (dismissBtn) dismissBtn.addEventListener('click', handleDismiss);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoginNotice, { once: true });
} else {
  initLoginNotice();
}
