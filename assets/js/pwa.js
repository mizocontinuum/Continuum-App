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
