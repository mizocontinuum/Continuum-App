/**
 * POST /api/auth/signup
 * Body: { email, password, fullName, turnstileToken? }
 */
import { readJson, json, fail, methodNotAllowed, clientIp, origin } from '../lib/http.js';
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
  const fullName = String(body.fullName || '').trim();

  if (!email || !password || !fullName) return fail(res, 400, 'All fields are required.');
  if (password.length < 8) return fail(res, 400, 'Password must be at least 8 characters long.');

  const ip = clientIp(req);

  const limited = await rateLimit(`signup:${ip}`);
  if (!limited.success) return fail(res, 429, 'Too many attempts. Please try again later.');

  const captcha = await verifyTurnstile(body.turnstileToken, ip);
  if (!captcha.success) return fail(res, 400, captcha.error);

  const redirectTo = `${origin(req)}/api/auth/callback?next=${encodeURIComponent('/home/')}`;
  const { ok, data } = await sb.signUp(email, password, { full_name: fullName, role: 'member' }, redirectTo);

  if (!ok) {
    const message = data?.msg || data?.error_description || 'Account creation failed. Please try again.';
    return fail(res, 400, message);
  }

  // With email confirmation enabled Supabase returns no session. When it is
  // disabled Supabase returns one (either flat or nested under `session`), so
  // persist it immediately - otherwise the client's redirect to /home/ would be
  // bounced back to /login/ by the middleware.
  const session = data?.session || (data?.access_token ? data : null);
  const tokens = session?.access_token ? issueSession(req, res, session) : null;

  return json(res, 200, {
    user: sb.publicUser(data?.user || data),
    needsEmailConfirmation: !session?.access_token,
    ...(tokens ? { session: tokens } : {})
  });
}
