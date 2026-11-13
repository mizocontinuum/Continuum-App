/**
 * POST /api/auth/update-password - set a new password for the signed-in user.
 * Used by the reset-password screen after the recovery link established a session.
 * Body: { password }
 */
import { readJson, json, fail, methodNotAllowed } from '../lib/http.js';
import { resolveSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Your reset link has expired. Please request a new one.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');
  const password = String(body.password || '');
  if (password.length < 8) return fail(res, 400, 'Password must be at least 8 characters long.');

  const { ok, data } = await sb.updateUser(session.accessToken, { password });
  if (!ok) {
    const message = data?.msg || data?.error_description || 'Could not update password. Please try again.';
    return fail(res, 400, message);
  }

  return json(res, 200, { ok: true });
}
