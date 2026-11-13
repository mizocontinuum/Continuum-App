/**
 * POST /api/auth/login
 * Body: { email, password, turnstileToken? }
 *
 * Returns, depending on who is calling:
 *   web    -> HttpOnly session cookies + { user }
 *   native -> { user, session: { access_token, refresh_token, expires_in } }
 *
 * If the account has a verified TOTP factor the aal1 token is held (cookie for
 * web, `mfaToken` for native) until /api/auth/mfa/verify.
 */
import { readJson, json, fail, methodNotAllowed, clientIp, isNativeClient } from '../lib/http.js';
import { setCookie, COOKIES } from '../lib/cookies.js';
import { issueSession } from '../lib/session.js';
import * as sb from '../lib/supabase.js';
import { rateLimit } from '../lib/ratelimit.js';
import { verifyTurnstile } from '../lib/turnstile.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!sb.isConfigured()) return fail(res, 500, 'Server authentication is not configured.');

  const body = await readJson(req);
  if (body === null) return fail(res, 400, 'Invalid request body.');

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return fail(res, 400, 'Email and password are required.');

  const ip = clientIp(req);

  const limited = await rateLimit(`login:${ip}`);
  if (!limited.success) {
    return fail(res, 429, 'Too many sign-in attempts. Please try again in a few minutes.');
  }

  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.success) return fail(res, 400, captcha.error);

  const { ok, status, data } = await sb.signInWithPassword(email, password);
  if (!ok) {
    const message = status === 429
      ? 'Too many attempts. Please wait a moment and try again.'
      : 'Invalid email or password.';
    return fail(res, status === 429 ? 429 : 401, message);
  }

  const verifiedTotp = (data?.user?.factors || []).find(
    (f) => f.factor_type === 'totp' && f.status === 'verified'
  );
  const claims = data?.access_token ? sb.decodeJwtPayload(data.access_token) : null;

  if (verifiedTotp && claims?.aal !== 'aal2') {
    if (isNativeClient(req)) {
      // No cookie jar on a native client, so the short-lived aal1 token travels
      // back as `mfaToken` and is echoed to /api/auth/mfa/verify.
      return json(res, 200, { mfaRequired: true, factorId: verifiedTotp.id, mfaToken: data.access_token });
    }
    setCookie(res, COOKIES.mfa, data.access_token, { maxAge: 300, httpOnly: true });
    return json(res, 200, { mfaRequired: true, factorId: verifiedTotp.id });
  }

  const session = issueSession(req, res, data);
  return json(res, 200, {
    user: sb.publicUser(data.user),
    ...(session ? { session } : {})
  });
}
