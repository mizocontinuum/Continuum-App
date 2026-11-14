/**
 * Continuum Academy service worker.
 *
 * Static assets only. Document navigations go directly to the browser so
 * redirects (such as auth middleware sending /home/ to /login/) work normally.
 * The backend under /api/* is also never touched by this worker.
 */
const CACHE_NAME = 'continuum-cache';
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
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((error) => {
        console.warn('Pre-cache error during install:', error);
      })
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

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
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
