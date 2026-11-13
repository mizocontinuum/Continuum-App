/**
 * Progressive web app plumbing.
 *
 * Registers the asset-only service worker and wires the in-page install
 * banner. Loaded as an ES module on every page, so it must never assume a
 * particular page depth: the service worker URL is resolved from this
 * module's own location instead of the document.
 */
const BANNER_ID = 'pwaInstallBanner';

/** The module lives at <site-root>/assets/js/pwa.js, so ../../sw.js is the root. */
const SW_URL = new URL('../../sw.js', import.meta.url).href;

let deferredPrompt = null;

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch((error) => {
      console.warn('Continuum service worker registration failed:', error);
    });
  });
}

/* Show the custom install banner when Chrome offers the native prompt. */
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  const banner = document.getElementById(BANNER_ID);
  if (banner) banner.classList.add('show');
});

window.addEventListener('appinstalled', () => {
  const banner = document.getElementById(BANNER_ID);
  if (banner) banner.classList.remove('show');
  deferredPrompt = null;
});

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById(BANNER_ID);
  if (!banner) return;

  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      banner.classList.remove('show');
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (_) {
        /* the install prompt was dismissed - nothing to do */
      }
      deferredPrompt = null;
    });
  }

  const dismissBtn = document.getElementById('pwaDismissBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => banner.classList.remove('show'));
  }
});
