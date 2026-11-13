/**
 * Thin server-side wrapper over the Supabase Auth + REST (PostgREST) HTTP APIs.
 *
 * We deliberately avoid shipping the Supabase SDK to the browser: all auth and
 * data calls are proxied here so the access/refresh tokens never leave
 * HttpOnly cookies.
 */
import { randomBytes, createHash } from 'node:crypto';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export function isConfigured() {
  return Boolean(SUPABASE_URL && ANON_KEY);
}

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function call(path, { method = 'GET', body, accessToken, headers = {} } = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || ANON_KEY}`,
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { ok: res.ok, status: res.status, data };
}

/* ----------------------------- Auth ------------------------------------- */

export function signInWithPassword(email, password) {
  return call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
}

export function signUp(email, password, data, redirectTo) {
  const q = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : '';
  return call(`/auth/v1/signup${q}`, { method: 'POST', body: { email, password, data } });
}

export function refreshSession(refreshToken) {
  return call('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: refreshToken }
  });
}

export function getUser(accessToken) {
  return call('/auth/v1/user', { accessToken });
}

export function updateUser(accessToken, payload) {
  return call('/auth/v1/user', { method: 'PUT', accessToken, body: payload });
}

export function signOut(accessToken) {
  return call('/auth/v1/logout', { method: 'POST', accessToken });
}

export function sendRecovery(email, redirectTo) {
  return call(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: 'POST',
    body: { email }
  });
}

/* --------------------------- OAuth / PKCE -------------------------------- */

export function generatePKCE() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export function buildOAuthUrl(provider, redirectTo, codeChallenge, scopes) {
  const params = new URLSearchParams({
    provider,
    redirect_to: redirectTo,
    code_challenge: codeChallenge,
    code_challenge_method: 's256'
  });
  if (scopes) params.set('scopes', scopes);
  return `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`;
}

export function exchangeCodeForSession(authCode, codeVerifier) {
  return call('/auth/v1/token?grant_type=pkce', {
    method: 'POST',
    body: { auth_code: authCode, code_verifier: codeVerifier }
  });
}

/* ------------------------------- MFA ------------------------------------- */

export function enrollFactor(accessToken, friendlyName) {
  return call('/auth/v1/factors', {
    method: 'POST',
    accessToken,
    body: { factor_type: 'totp', friendly_name: friendlyName }
  });
}

export function challengeFactor(accessToken, factorId) {
  return call(`/auth/v1/factors/${factorId}/challenge`, { method: 'POST', accessToken, body: {} });
}

export function verifyFactor(accessToken, factorId, challengeId, code) {
  return call(`/auth/v1/factors/${factorId}/verify`, {
    method: 'POST',
    accessToken,
    body: { challenge_id: challengeId, code }
  });
}

export function unenrollFactor(accessToken, factorId) {
  return call(`/auth/v1/factors/${factorId}`, { method: 'DELETE', accessToken });
}

/* ------------------------------- Data ------------------------------------ */

export function restSelect(table, query, accessToken) {
  return call(`/rest/v1/${table}?${query}`, { accessToken });
}

export function restInsert(table, rows, accessToken) {
  return call(`/rest/v1/${table}`, {
    method: 'POST',
    accessToken,
    headers: { Prefer: 'return=representation' },
    body: rows
  });
}

export function restDelete(table, query, accessToken) {
  return call(`/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    accessToken,
    headers: { Prefer: 'return=minimal' }
  });
}

/**
 * Insert, or merge into an existing row when it collides on onConflict.
 * PostgREST updates only the columns present in the payload, so a partial row
 * (e.g. { user_id, video_id }) leaves unrelated columns such as created_at
 * untouched. Requires a unique index on the onConflict columns.
 * `onConflict` is a fixed, code-owned column list (e.g. "user_id,video_id"),
 * never user input, so it is passed through as-is.
 */
export function restUpsert(table, rows, accessToken, onConflict) {
  const q = onConflict ? `?on_conflict=${onConflict}` : '';
  return call(`/rest/v1/${table}${q}`, {
    method: 'POST',
    accessToken,
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: rows
  });
}

/** Partial update. `query` must pin the target rows (RLS filters the rest). */
export function restUpdate(table, query, patch, accessToken) {
  return call(`/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    accessToken,
    headers: { Prefer: 'return=representation' },
    body: patch
  });
}

/* ------------------------------ Helpers ---------------------------------- */

/** Trim a Supabase user object down to what the browser is allowed to see. */
export function publicUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: meta.full_name || null,
    // Honour app_metadata.role too: that is the field admins set and users
    // cannot edit, so it must win over the self-service user_metadata copy.
    role: user.app_metadata?.role || meta.role || 'member',
    factors: (user.factors || []).map((f) => ({
      id: f.id,
      type: f.factor_type,
      status: f.status,
      name: f.friendly_name || null
    }))
  };
}

/** Decode (without verifying) a JWT payload - used only on tokens we just received. */
export function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}
