/**
 * POST /api/auth/oauth
 * Body: { provider, next?, scopes? }
 * Returns { url } for the browser to redirect to (PKCE flow).
 */
import { readJson, json, fail, methodNotAllowed, origin, safeNext } from '../lib/http.js';
import { setCookie, COOKIES } from '../lib/cookies.js';
import * as sb from '../lib/supabase.js';

const PROVIDERS = new Set(['google', 'apple', 'github', 'azure', 'facebook']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const provider = String(body.provider || '').toLowerCase();
  if (!PROVIDERS.has(provider)) return fail(res, 400, 'Unsupported sign-in provider.');

  const next = safeNext(body.next, '/home/');
  const { verifier, challenge } = sb.generatePKCE();
  // SameSite=Lax (not the Strict default): the provider redirects back to
  // /api/auth/callback with a cross-site, top-level GET navigation, and Strict
  // cookies are withheld on those - which would make the verifier unreadable
  // and every sign-in fail with "session expired". The cookie is short-lived,
  // HttpOnly and still __Host- prefixed.
  setCookie(res, COOKIES.pkce, verifier, { maxAge: 600, httpOnly: true, sameSite: 'Lax' });

  const redirectTo = `${origin(req)}/api/auth/callback?next=${encodeURIComponent(next)}`;
  const url = sb.buildOAuthUrl(provider, redirectTo, challenge, body.scopes);
  return json(res, 200, { url });
}
