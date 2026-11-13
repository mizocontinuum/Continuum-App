/**
 * Admin data access for videos.
 *   GET    /api/admin/videos?disciplineId=...
 *   POST   /api/admin/videos            body: { id?, disciplineId, title,
 *                                               subtitle?, description?,
 *                                               speakerId?, durationSec?,
 *                                               posterUrl?, videoUrl?, tags?,
 *                                               year?, rating?, views?,
 *                                               isClip?, featured?, sortOrder? }
 *   DELETE /api/admin/videos?id=...
 *
 * The caller's own access token is used for the PostgREST call so Supabase RLS
 * still applies on top of the admin check here.
 *
 * Bodies are camelCase, matching the shared `Video` type, and rows are
 * converted both ways by server/lib/map.js - the single file that knows the
 * column names.
 */
import { readJson, json, fail, methodNotAllowed, query, apiHandler } from '../../server/lib/http.js';
import { resolveSession, isAdmin } from '../../server/lib/session.js';
import { toVideo, videoToRow } from '../../server/lib/map.js';
import * as sb from '../../server/lib/supabase.js';

const ORDER = 'order=sort_order.asc,created_at.asc';
const SELECT = `select=*,speakers(name)&${ORDER}`;

async function handler(req, res) {
  if (!sb.isConfigured()) return fail(res, 500, 'Server data layer is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');
  if (!isAdmin(session.user)) return fail(res, 403, 'Administrator access required.');

  const token = session.accessToken;

  if (req.method === 'GET') {
    const disciplineId = query(req).disciplineId;
    if (!disciplineId) return fail(res, 400, 'Missing disciplineId.');
    const filter = `discipline_id=eq.${encodeURIComponent(disciplineId)}`;
    const { ok, data } = await sb.restSelect('videos', `${SELECT}&${filter}`, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not load videos.');
    return json(res, 200, { videos: (data || []).map(toVideo) });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const disciplineId = String(body.disciplineId || '').trim();
    const title = String(body.title || '').trim();
    if (!disciplineId) return fail(res, 400, 'A discipline must be selected.');
    if (!title) return fail(res, 400, 'A title is required.');

    const row = videoToRow({
      ...body,
      // `id` is a text primary key with no database default, so the server
      // mints one when the client does not supply it.
      id: body.id || `v-${Date.now().toString(36)}`,
      disciplineId,
      title
    });

    const { ok, data } = await sb.restInsert('videos', [row], token);
    if (!ok) return fail(res, 400, data?.message || 'Could not add video.');
    const created = Array.isArray(data) ? data[0] : data;
    return json(res, 201, { video: toVideo(created) });
  }

  if (req.method === 'DELETE') {
    const id = query(req).id;
    if (!id) return fail(res, 400, 'Missing video id.');
    const { ok, data } = await sb.restDelete('videos', `id=eq.${encodeURIComponent(id)}`, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not delete video.');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, 'GET, POST, DELETE');
}

export default apiHandler(handler);
