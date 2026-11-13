/**
 * GET /api/auth/callback?code=...&next=...
 * Completes the OAuth PKCE exchange and stores the session in HttpOnly cookies.
 */
import { redirect, query, origin, safeNext } from '../lib/http.js';
import { parseCookies, COOKIES, clearCookie, setSessionCookies } from '../lib/cookies.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  const params = query(req);
  const base = origin(req);
  const next = safeNext(params.next, '/home/');
  const failUrl = (message) => `${base}/login/?error=${encodeURIComponent(message)}`;

  if (params.error) {
    return redirect(res, failUrl(params.error_description || params.error));
  }
  if (!sb.isConfigured()) {
    return redirect(res, failUrl('Server authentication is not configured.'));
  }

  const code = params.code;
  if (!code) return redirect(res, failUrl('Missing authorization code.'));

  const cookies = parseCookies(req);
  const verifier = cookies[COOKIES.pkce];
  // Clear with the same attributes it was set with (oauth.js uses Lax).
  clearCookie(res, COOKIES.pkce, { httpOnly: true, sameSite: 'Lax' });
  if (!verifier) return redirect(res, failUrl('Sign-in session expired. Please try again.'));

  const { ok, data } = await sb.exchangeCodeForSession(code, verifier);
  if (!ok || !data?.access_token) {
    return redirect(res, failUrl('Could not complete sign-in. Please try again.'));
  }

  setSessionCookies(res, data);
  return redirect(res, `${base}${next}`);
}
