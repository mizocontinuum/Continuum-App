/**
 * Progressive web app plumbing.
 *
 * Registers the asset-only service worker. Loaded as an ES module on every
 * page, so it must never assume a particular page depth: the service worker
 * URL is resolved from this module's own location instead of the document.
 */

/** The module lives at <site-root>/assets/js/pwa.js, so ../../sw.js is the root. */
const SW_URL = new URL('../../sw.js', import.meta.url).href;

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch((error) => {
      console.warn('Continuum service worker registration failed:', error);
    });
  });
}

/* /* nav-update */ Auto-hide bottom bar on scroll down, show on scroll up */
(() => {
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const bNav = document.querySelector('.bottom-nav-container');
    if (!bNav || window.innerWidth > 760) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const curY = window.scrollY;
    const diff = curY - lastY;
    if (diff > 10 && curY > 50) {
      bNav.classList.add('nav-hidden');
    } else if (diff < -10) {
      bNav.classList.remove('nav-hidden');
    }
    lastY = curY;
  }, { passive: true });
})();
