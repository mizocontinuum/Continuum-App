/**
 * POST /api/auth/adopt-session
 * Body: { access_token, refresh_token }
 *
 * Used by the implicit-flow links (password recovery emails) where Supabase
 * returns tokens in the URL fragment. The page forwards them here once, the
 * server validates them, and for a browser they are immediately moved into
 * HttpOnly cookies; a native caller gets them back so they can be stored in the
 * device keychain.
 */
import { readJson, json, fail, methodNotAllowed } from '../lib/http.js';
import { issueSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const accessToken = String(body.access_token || '');
  const refreshToken = String(body.refresh_token || '');
  if (!accessToken) return fail(res, 400, 'Missing token.');

  const me = await sb.getUser(accessToken);
  if (!me.ok || !me.data?.id) return fail(res, 401, 'This link is invalid or has expired.');

  const session = issueSession(req, res, {
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expires_in: 3600
  });

  return json(res, 200, {
    user: sb.publicUser(me.data),
    ...(session ? { session } : {})
  });
}
