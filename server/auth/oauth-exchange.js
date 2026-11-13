/**
 * POST /api/auth/oauth/exchange (native clients only)
 * Body: { code, codeVerifier }
 *
 * Second half of the mobile social sign-in: the app captured the authorization
 * code on its deep link, and hands it back here with the verifier it was given
 * by /api/auth/oauth. Returns the same token pair as /api/auth/login.
 */
import { readJson, json, fail, methodNotAllowed, isNativeClient } from '../lib/http.js';
import { issueSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  // Tokens in a response body are for the keychain, never for a browser.
  if (!isNativeClient(req)) return fail(res, 403, 'This endpoint is only available to the mobile app.');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const code = String(body.code || '').trim();
  const codeVerifier = String(body.codeVerifier || '').trim();
  if (!code || !codeVerifier) return fail(res, 400, 'Missing authorization code.');

  const { ok, data } = await sb.exchangeCodeForSession(code, codeVerifier);
  if (!ok || !data?.access_token) {
    return fail(res, 401, 'Could not complete sign-in. Please try again.');
  }

  const me = await sb.getUser(data.access_token);
  const session = issueSession(req, res, data);

  return json(res, 200, {
    user: sb.publicUser(me.ok ? me.data : data.user),
    session
  });
}
