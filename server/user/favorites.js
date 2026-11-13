/**
 * My List (watchlist).
 *   GET    /api/user/favorites - the caller's saved videos, with metadata
 *   POST   /api/user/favorites - add { video_id }
 *   DELETE /api/user/favorites - remove ?video_id=
 *
 * The caller's own access token is used for the PostgREST call so Supabase
 * Row-Level Security still applies.
 */
import { readJson, json, fail, methodNotAllowed, query } from '../lib/http.js';
import { resolveSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (!sb.isConfigured()) return fail(res, 500, 'Server data layer is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');

  const token = session.accessToken;
  const userId = session.user.id;

  if (req.method === 'GET') {
    // Embed the joined video so the library can render titles without a
    // second round-trip (favorites.video_id -> videos.id foreign key).
    const { ok, data } = await sb.restSelect(
      'favorites',
      'select=*,videos(*)&order=created_at.desc',
      token
    );
    if (!ok) return fail(res, 400, data?.message || 'Could not load favorites.');
    return json(res, 200, { favorites: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const videoId = String(body.video_id || '').trim();
    if (!videoId) return fail(res, 400, 'A video_id is required.');

    const { ok, data } = await sb.restUpsert(
      'favorites',
      [{ user_id: userId, video_id: videoId }],
      token,
      'user_id,video_id'
    );
    if (!ok) return fail(res, 400, data?.message || 'Could not add to My List.');
    return json(res, 200, { favorite: Array.isArray(data) ? data[0] : data });
  }

  if (req.method === 'DELETE') {
    const videoId = query(req).video_id;
    if (!videoId) return fail(res, 400, 'Missing video_id.');

    const target = `user_id=eq.${encodeURIComponent(userId)}&video_id=eq.${encodeURIComponent(videoId)}`;
    const { ok, data } = await sb.restDelete('favorites', target, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not remove from My List.');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, 'GET, POST, DELETE');
}
