/**
 * POST /api/auth/refresh (native clients only)
 * Body: { refresh_token }
 *
 * Rotates an expired access token. Deliberately separate from the normal
 * request path: the app calls this only when a request comes back 401, so two
 * concurrent calls can never race to consume the same refresh token.
 *
 * A browser cannot use this - it would be handed tokens in a body, which is
 * exactly what the HttpOnly cookie design exists to prevent. Web sessions are
 * refreshed transparently inside resolveSession() instead.
 */
import { readJson, json, fail, methodNotAllowed, isNativeClient } from '../lib/http.js';
import { issueSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';
import { rateLimit } from '../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!isNativeClient(req)) return fail(res, 403, 'This endpoint is only available to the mobile app.');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const refreshToken = String(body.refresh_token || '').trim();
  if (!refreshToken) return fail(res, 400, 'Missing refresh token.');

  const limited = await rateLimit(`refresh:${refreshToken.slice(-16)}`);
  if (!limited.success) return fail(res, 429, 'Too many refresh attempts. Please sign in again.');

  const { ok, data } = await sb.refreshSession(refreshToken);
  if (!ok || !data?.access_token) {
    // A refresh token that no longer works means the app must sign in again.
    return fail(res, 401, 'Your session has expired. Please sign in again.');
  }

  const me = await sb.getUser(data.access_token);
  const session = issueSession(req, res, data);

  return json(res, 200, {
    user: sb.publicUser(me.ok ? me.data : data.user),
    session
  });
}
