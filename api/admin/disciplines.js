/**
 * Admin data access for disciplines.
 *   GET    /api/admin/disciplines
 *   POST   /api/admin/disciplines      body: { id?, name, goal?, description?,
 *                                              emoji?, accent?, accentDeep?,
 *                                              sortOrder? }
 *   DELETE /api/admin/disciplines?id=...
 *
 * The caller's own access token is used for the PostgREST call so Supabase RLS
 * still applies on top of the admin check here.
 *
 * Bodies are camelCase, matching the shared `Discipline` type, and rows are
 * converted both ways by server/lib/map.js - the single file that knows the
 * column names.
 */
import { readJson, json, fail, methodNotAllowed, query, apiHandler } from '../../server/lib/http.js';
import { resolveSession, isAdmin } from '../../server/lib/session.js';
import { toDiscipline, disciplineToRow } from '../../server/lib/map.js';
import * as sb from '../../server/lib/supabase.js';

const ORDER = 'sort_order.asc,created_at.asc';

async function handler(req, res) {
  if (!sb.isConfigured()) return fail(res, 500, 'Server data layer is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');
  if (!isAdmin(session.user)) return fail(res, 403, 'Administrator access required.');

  const token = session.accessToken;

  if (req.method === 'GET') {
    const { ok, data } = await sb.restSelect('disciplines', `select=*&order=${ORDER}`, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not load disciplines.');
    return json(res, 200, { disciplines: (data || []).map(toDiscipline) });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const name = String(body.name || '').trim();
    if (!name) return fail(res, 400, 'A name is required.');

    // `id` is a text primary key with no database default, so the server mints
    // one when the client does not supply it.
    const row = disciplineToRow({
      ...body,
      id: body.id || `d-${Date.now().toString(36)}`,
      name,
      goal: String(body.goal || '').trim(),
      description: String(body.description || '').trim()
    });

    const { ok, data } = await sb.restInsert('disciplines', [row], token);
    if (!ok) return fail(res, 400, data?.message || 'Could not create discipline.');
    const created = Array.isArray(data) ? data[0] : data;
    return json(res, 201, { discipline: toDiscipline(created) });
  }

  if (req.method === 'DELETE') {
    const id = query(req).id;
    if (!id) return fail(res, 400, 'Missing discipline id.');
    const { ok, data } = await sb.restDelete('disciplines', `id=eq.${encodeURIComponent(id)}`, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not delete discipline.');
    return json(res, 200, { ok: true });
  }

  return methodNotAllowed(res, 'GET, POST, DELETE');
}

export default apiHandler(handler);
