/**
 * POST /api/auth/logout - revokes the Supabase session.
 *
 *   web    -> also clears the HttpOnly cookies
 *   native -> the app deletes its own tokens; nothing to clear server-side, but
 *             the session is still revoked upstream so the token pair is dead.
 */
import { json, methodNotAllowed, bearerToken } from '../lib/http.js';
import { parseCookies, COOKIES, clearSessionCookies } from '../lib/cookies.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const cookies = parseCookies(req);
  const access = bearerToken(req) || cookies[COOKIES.access] || cookies[COOKIES.mfa];

  if (access && sb.isConfigured()) {
    try {
      await sb.signOut(access);
    } catch (err) {
      // Never block a sign-out on an upstream hiccup: the client must always be
      // able to leave, and the cookies/tokens are discarded regardless.
      console.error('Sign out upstream failed:', err?.message || err);
    }
  }

  clearSessionCookies(res);
  return json(res, 200, { ok: true });
}
