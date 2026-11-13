/**
 * POST /api/auth/mfa/unenroll
 * Body: { factorId? }
 *
 * Turns off TOTP two-factor for the signed-in user. When no factorId is given
 * the user's first TOTP factor is removed.
 */
import { readJson, json, fail, methodNotAllowed } from '../../lib/http.js';
import { resolveSession } from '../../lib/session.js';
import * as sb from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  let factorId = body.factorId;
  if (!factorId) {
    const me = await sb.getUser(session.accessToken);
    const factors = me.data?.factors || [];
    factorId = factors.find((f) => f.factor_type === 'totp')?.id;
  }
  if (!factorId) return fail(res, 400, 'No two-factor method is enabled on this account.');

  const { ok, data } = await sb.unenrollFactor(session.accessToken, factorId);
  if (!ok) return fail(res, 400, data?.msg || 'Could not turn off two-factor. Please sign in again and retry.');

  return json(res, 200, { ok: true });
}
