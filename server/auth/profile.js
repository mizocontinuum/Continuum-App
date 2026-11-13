/**
 * GET  /api/auth/profile - current user profile
 * PATCH /api/auth/profile - update user_metadata (e.g. display name)
 */
import { readJson, json, fail, methodNotAllowed } from '../lib/http.js';
import { resolveSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');

  if (req.method === 'GET') {
    return json(res, 200, { user: sb.publicUser(session.user) });
  }

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const updates = {};
    if (typeof body.full_name === 'string') {
      const name = body.full_name.trim();
      if (name.length < 2) return fail(res, 400, 'Please enter a valid name.');
      updates.full_name = name;
    }
    if (Object.keys(updates).length === 0) return fail(res, 400, 'Nothing to update.');

    const { ok, data } = await sb.updateUser(session.accessToken, { data: updates });
    if (!ok) return fail(res, 400, data?.msg || 'Could not update profile.');

    return json(res, 200, { user: sb.publicUser(data) });
  }

  return methodNotAllowed(res, 'GET, PATCH');
}
