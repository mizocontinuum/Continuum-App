/**
 * Continuum Academy service worker.
 *
 * Static assets only. Document navigations go directly to the browser so
 * redirects (such as auth middleware sending /home/ to /login/) work normally.
 * The backend under /api/* is also never touched by this worker.
 */
const CACHE_NAME = 'continuum-cache-v22';
const PRECACHE_URLS = [
  './manifest.json',
  './assets/css/base/foundation.css',
  './assets/css/base/theme.css',
  './assets/css/base/auth.css',
  './assets/css/pages/landing.css',
  './assets/images/icon-circle-192.png',
  './assets/images/icon-circle-512.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/favicon-32x32.png',
  './assets/images/favicon-16x16.png',
  './assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        // Bypass the browser HTTP cache so a bumped CACHE_NAME always pulls
        // the latest assets instead of re-staling them from disk cache.
        Promise.all(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: 'reload' })
              .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                  return cache.put(url, response.clone()).then(() => response);
                }
                return response;
              })
              .catch((error) => {
                console.warn('Pre-cache fetch failed for', url, error);
              })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Let the browser handle document redirects from protected routes. Navigation
  // requests use redirect mode "manual"; forwarding them through fetch() can
  // reject an opaqueredirect response as a network error.
  if (event.request.mode === 'navigate') return;

  // Never cache the API. A cached /api/auth/session would paint a stale
  // identity, and a cached 401 would lock a signed-in member out.
  if (url.pathname.startsWith('/api/')) return;

  // In local development or previews, prioritize network so CSS/JS changes are immediately visible
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      // Bypass the browser HTTP cache so first-time network fetches store
      // fresh content, not a stale copy from disk cache.
      return fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
