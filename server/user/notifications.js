/**
 * Notification bell feed.
 *   GET  /api/user/notifications - the caller's notifications + unread count
 *   POST /api/user/notifications - mark one read { id }
 *
 * Rows are created out-of-band (SQL Editor / service role); the app only
 * reads them and marks them read. RLS keeps every row owner-scoped.
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
    const [list, unread] = await Promise.all([
      sb.restSelect('notifications', 'select=*&order=created_at.desc&limit=50', token),
      sb.restSelect('notifications', 'select=id&read=is.false', token)
    ]);
    if (!list.ok) return fail(res, 400, list.data?.message || 'Could not load notifications.');

    return json(res, 200, {
      notifications: list.data || [],
      unread: unread.ok ? (unread.data || []).length : 0
    });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (body === null) return fail(res, 400, 'Invalid request body.');

    const id = String(body.id || '').trim();
    if (!id) return fail(res, 400, 'A notification id is required.');

    const target = `id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}`;
    const { ok, data } = await sb.restUpdate('notifications', target, { read: true }, token);
    if (!ok) return fail(res, 400, data?.message || 'Could not update notification.');
    return json(res, 200, { notification: Array.isArray(data) ? data[0] : data });
  }

  return methodNotAllowed(res, 'GET, POST');
}
