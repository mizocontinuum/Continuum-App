/**
 * POST /api/auth/mfa/enroll
 * Starts TOTP enrollment for the signed-in user; returns the secret + QR SVG.
 */
import { json, fail, methodNotAllowed } from '../../lib/http.js';
import { resolveSession } from '../../lib/session.js';
import * as sb from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const session = await resolveSession(req, res);
  if (!session) return fail(res, 401, 'Not authenticated.');

  const { ok, data } = await sb.enrollFactor(session.accessToken, 'Continuum Authenticator');
  if (!ok) return fail(res, 400, data?.msg || 'Could not start 2FA enrollment.');

  return json(res, 200, {
    factorId: data.id,
    secret: data.totp?.secret || null,
    uri: data.totp?.uri || null,
    qr: data.totp?.qr_code || null
  });
}
