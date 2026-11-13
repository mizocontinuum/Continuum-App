/**
 * GET /api/auth/session - returns the current user (or 401) and refreshes
 * expired access tokens transparently.
 */
import { json, methodNotAllowed } from '../lib/http.js';
import { resolveSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
  if (!sb.isConfigured()) return json(res, 401, { user: null });

  const session = await resolveSession(req, res);
  if (!session) return json(res, 401, { user: null });

  return json(res, 200, { user: sb.publicUser(session.user) });
}
