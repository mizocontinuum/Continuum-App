/**
 * POST /api/auth/forgot - send a password recovery email.
 * Body: { email }
 */
import { readJson, json, methodNotAllowed, origin } from '../lib/http.js';
import * as sb from '../lib/supabase.js';
import { rateLimit } from '../lib/ratelimit.js';
import { clientIp } from '../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const body = await readJson(req);
  if (body === null) return fail400(res);
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return fail400(res, 'Email address is required.');

  const limited = await rateLimit(`forgot:${clientIp(req)}`);
  if (!limited.success) return json(res, 429, { error: 'Too many requests. Please try again later.' });

  if (!sb.isConfigured()) return json(res, 200, { ok: true });

  const redirectTo = `${origin(req)}/reset-password/`;
  try {
    await sb.sendRecovery(email, redirectTo);
  } catch (err) {
    console.error('Recovery email failed:', err?.message || err);
  }

  // Always answer 200 so we never reveal whether an address is registered.
  return json(res, 200, { ok: true });
}

function fail400(res, message = 'Invalid request body.') {
  return json(res, 400, { error: message });
}
