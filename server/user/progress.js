/**
 * User resume points.
 *   GET  /api/user/progress - the caller's saved positions, newest first
 *   POST /api/user/progress - upsert { video_id, position, completed }
 *
 * The caller's own access token is used for the PostgREST call so Supabase
 * Row-Level Security still applies (user_id must equal auth.uid()).
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
    const { ok, data } = await sb.restSelect('progress', 'select=*&order=updated_at.desc', token);
    if (!ok) return fail(res, 400, data?.message || 'Could not load progress.');
    return json(res, 200, { progress: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const videoId = String(body.video_id || '').trim();
    if (!videoId) return fail(res, 400, 'A video_id is required.');

    const seconds = Number(body.position);
    const row = {
      user_id: userId,
      video_id: videoId,
      position: Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0,
      completed: Boolean(body.completed),
      updated_at: new Date().toISOString()
    };

    const { ok, data } = await sb.restUpsert('progress', [row], token, 'user_id,video_id');
    if (!ok) return fail(res, 400, data?.message || 'Could not save progress.');
    return json(res, 200, { progress: Array.isArray(data) ? data[0] : data });
  }

  return methodNotAllowed(res, 'GET, POST');
}
