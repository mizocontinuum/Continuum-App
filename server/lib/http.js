/**
 * Shared HTTP helpers for the serverless auth/data functions.
 * These run in Vercel's Node.js runtime (req = IncomingMessage, res = ServerResponse).
 */

export function json(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(body));
}

export function fail(res, status, message) {
  json(res, status, { error: message });
}

export function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow);
  json(res, 405, { error: 'Method not allowed' });
}

export function redirect(res, location, status = 302) {
  res.statusCode = status;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end();
}

/** Read and JSON-parse a request body. Returns {} for empty, null for invalid JSON. */
export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Parse the query string from a raw request URL. */
export function query(req) {
  const url = new URL(req.url || '/', 'http://internal');
  return Object.fromEntries(url.searchParams.entries());
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '0.0.0.0';
}

/** Absolute origin of the incoming request, e.g. https://example.com */
export function origin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  return `${proto}://${host}`;
}

/** Only allow same-origin (relative) redirect targets to avoid open-redirect. */
export function safeNext(value, fallback = '/home/') {
  if (typeof value !== 'string' || !value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

/* ---------------------------------------------------------------------------
 * Credential + client detection
 * ------------------------------------------------------------------------ */

/**
 * True only for the native mobile app asking to be given bearer tokens.
 *
 * This predicate is what stops a browser from ever obtaining a JS-readable
 * access token. Browsers always attach `Sec-Fetch-*` to fetch/XHR, and send an
 * `Origin` header on every non-GET request; React Native's fetch sends
 * neither. So a compromised page cannot simply set `X-Client-Platform: native`
 * and be handed tokens - the request is still recognised as a browser and stays
 * cookie-only.
 */
export function isNativeClient(req) {
  const headers = req?.headers;
  if (!headers) return false;
  if (headers['sec-fetch-mode'] || headers['sec-fetch-site'] || headers['sec-fetch-dest']) {
    return false;
  }
  if (headers.origin) return false;
  const platform = String(headers['x-client-platform'] || '').toLowerCase();
  return platform === 'native' || platform === 'ios' || platform === 'android';
}

/** Bearer token from the Authorization header, or null. */
export function bearerToken(req) {
  const raw = req?.headers?.authorization;
  if (typeof raw !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match ? match[1].trim() : null;
}

/* ---------------------------------------------------------------------------
 * CORS
 *
 * Deliberately narrow: `Access-Control-Allow-Credentials` is NEVER sent, so a
 * cross-origin browser can neither read responses nor send session cookies.
 * Web clients must therefore be served from the same origin as this API (see
 * the deployment notes in .env.example). The allow-list exists only so the
 * Expo web dev server on localhost can talk to the API while developing.
 * ------------------------------------------------------------------------ */

const DEV_ORIGINS = new Set([
  'http://localhost:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
  'http://localhost:19006',
  'http://127.0.0.1:19006'
]);

/** The caller's origin if it is explicitly allowed, otherwise null. */
export function allowedOrigin(req) {
  const origin = req?.headers?.origin;
  if (typeof origin !== 'string' || !origin) return null;

  const configured = String(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (configured.includes(origin)) return origin;

  // Local development only. A production deployment never matches these.
  if (process.env.NODE_ENV !== 'production' && DEV_ORIGINS.has(origin)) return origin;
  return null;
}

/** Apply CORS headers if the origin is allowed. @returns {boolean} applied */
export function applyCors(req, res) {
  const origin = allowedOrigin(req);
  if (!origin) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  return true;
}

/** Answer a CORS preflight. */
export function preflight(res, methods = 'GET, POST, PATCH, DELETE') {
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Client-Platform'
  );
  res.setHeader('Access-Control-Max-Age', '600');
  res.statusCode = 204;
  res.end();
}

/* ---------------------------------------------------------------------------
 * Every /api entry point is wrapped in this.
 *
 * Two guarantees, and both matter for "the client never sees a broken
 * response":
 *   1. An unexpected throw becomes a JSON 500 instead of Vercel's HTML error
 *      page - a client calling res.json() would otherwise blow up parsing it.
 *   2. CORS headers and the preflight are handled once, in one place, so a new
 *      route cannot forget them.
 * ------------------------------------------------------------------------ */

export function apiHandler(handler, { methods = 'GET, POST, PATCH, DELETE' } = {}) {
  return async function route(req, res) {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return preflight(res, methods);

    try {
      return await handler(req, res);
    } catch (err) {
      console.error(`API ${req.method} ${req.url} failed:`, err);
      if (res.headersSent || res.writableEnded) return undefined;
      return fail(res, 500, 'Something went wrong on our side. Please try again.');
    }
  };
}
