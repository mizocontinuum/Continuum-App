/**
 * Cookie helpers.
 *
 * Session tokens live ONLY in HttpOnly, Secure, SameSite=Strict cookies, so a
 * successful XSS can never read or exfiltrate them (see security blueprint 3.2).
 * Using the `__Host-` prefix guarantees: Secure, Path=/, and no Domain attribute,
 * which stops sub-domain cookie injection / fixation.
 */

export const COOKIES = {
  access: '__Host-ca-access',
  refresh: '__Host-ca-refresh',
  flag: 'ca-auth', // readable by JS only to gate UI, contains no secret
  pkce: '__Host-ca-pkce',
  mfa: '__Host-ca-mfa'
};

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function serialize(name, value, opts = {}) {
  const { maxAge, path = '/', httpOnly = true, secure = true, sameSite = 'Strict' } = opts;
  const parts = [`${name}=${encodeURIComponent(value ?? '')}`];
  parts.push(`Path=${path}`);
  parts.push(`SameSite=${sameSite}`);
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  if (typeof maxAge === 'number') parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

function append(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  const next = existing
    ? (Array.isArray(existing) ? [...existing, cookie] : [existing, cookie])
    : [cookie];
  res.setHeader('Set-Cookie', next);
}

export function setCookie(res, name, value, opts) {
  append(res, serialize(name, value, opts));
}

export function clearCookie(res, name, opts = {}) {
  append(res, serialize(name, '', { ...opts, maxAge: 0 }));
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(pair.slice(idx + 1).trim());
    } catch {
      out[key] = pair.slice(idx + 1).trim();
    }
  }
  return out;
}

/** Persist a Supabase session (access_token + refresh_token) into cookies. */
export function setSessionCookies(res, session) {
  const accessMaxAge = Math.max(60, (session.expires_in || 3600) - 30);
  setCookie(res, COOKIES.access, session.access_token, { maxAge: accessMaxAge, httpOnly: true });
  if (session.refresh_token) {
    setCookie(res, COOKIES.refresh, session.refresh_token, { maxAge: THIRTY_DAYS, httpOnly: true });
  }
  setCookie(res, COOKIES.flag, '1', { maxAge: THIRTY_DAYS, httpOnly: false });
}

export function clearSessionCookies(res) {
  clearCookie(res, COOKIES.access, { httpOnly: true });
  clearCookie(res, COOKIES.refresh, { httpOnly: true });
  clearCookie(res, COOKIES.flag, { httpOnly: false });
  clearCookie(res, COOKIES.mfa, { httpOnly: true });
}
