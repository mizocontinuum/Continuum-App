/**
 * Member profile row.
 *   GET   /api/user/profile - the caller's profile (viewer-shaped default when
 *                             the signup trigger has not created it yet)
 *   PATCH /api/user/profile - update { full_name }
 *
 * This is the public.profiles row, distinct from /api/auth/profile which owns
 * the auth user_metadata copy. Kept owner-only by RLS.
 */
import { readJson, json, fail, methodNotAllowed } from '../lib/http.js';
import { resolveSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (!sb.isConfigured()) return fail(res, 500, 'Server data layer is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');

  const token = session.accessToken;
  const userId = session.user.id;

  if (req.method === 'GET') {
    const { ok, data } = await sb.restSelect('profiles', `select=*&id=eq.${encodeURIComponent(userId)}`, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not load profile.');

    const row = (data || [])[0] || {
      id: userId,
      full_name: session.user.user_metadata?.full_name || null,
      avatar_url: null
    };
    return json(res, 200, { profile: row });
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

    // Upsert so the row is created even if the signup trigger was never run.
    const { ok, data } = await sb.restUpsert(
      'profiles',
      [{ id: userId, ...updates }],
      token,
      'id'
    );
    if (!ok) return fail(res, 400, data?.message || 'Could not update profile.');
    return json(res, 200, { profile: Array.isArray(data) ? data[0] : data });
  }

  return methodNotAllowed(res, 'GET, PATCH');
}
