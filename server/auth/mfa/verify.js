/**
 * POST /api/auth/mfa/verify
 * Body: { code, factorId? }
 * Verifies a TOTP code (during login aal1->aal2, or during enrollment) and
 * promotes the session into HttpOnly cookies.
 */
import { readJson, json, fail, methodNotAllowed } from '../../lib/http.js';
import { parseCookies, COOKIES, clearCookie } from '../../lib/cookies.js';
import { resolveSession, issueSession } from '../../lib/session.js';
import * as sb from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const code = String(body.code || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return fail(res, 400, 'Enter the 6-digit code from your authenticator app.');
  }

  const cookies = parseCookies(req);
  // The aal1 token comes from the mfa cookie on web, and from `mfaToken` on
  // mobile (a native client has no cookie jar to park it in).
  let token = cookies[COOKIES.mfa] || String(body.mfaToken || '').trim() || null;
  let factorId = body.factorId;

  if (!token) {
    const session = await resolveSession(req, res);
    if (!session) return fail(res, 401, 'Not authenticated.');
    token = session.accessToken;
  }

  if (!factorId) {
    const me = await sb.getUser(token);
    const factors = me.data?.factors || [];
    const factor = factors.find((f) => f.factor_type === 'totp' && f.status === 'verified') || factors[0];
    factorId = factor?.id;
  }
  if (!factorId) return fail(res, 400, 'No 2FA factor found for this account.');

  const challenge = await sb.challengeFactor(token, factorId);
  if (!challenge.ok) return fail(res, 400, challenge.data?.msg || 'Could not start verification.');

  const verified = await sb.verifyFactor(token, factorId, challenge.data?.id, code);
  if (!verified.ok) {
    return fail(res, 400, verified.data?.msg || 'Invalid code. Please try again.');
  }

  clearCookie(res, COOKIES.mfa, { httpOnly: true });
  const session = verified.data?.access_token ? issueSession(req, res, verified.data) : null;

  return json(res, 200, {
    user: sb.publicUser(verified.data?.user),
    ...(session ? { session } : {})
  });
}
