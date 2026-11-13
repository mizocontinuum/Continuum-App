/**
 * Session resolution for both client types.
 *
 *   Web browser  -> HttpOnly `__Host-` cookies. JavaScript can never read them.
 *   Native app   -> `Authorization: Bearer <access_token>`, stored by the app in
 *                   the OS keychain (expo-secure-store / Keychain / Keystore).
 *
 * A native request is never auto-refreshed here on purpose. Rotation would have
 * to return the new refresh token in the body of whichever unrelated request
 * happened to trigger it, and two concurrent requests could then race and
 * invalidate each other. Instead the app calls POST /api/auth/refresh, which is
 * a deliberate, serialised round-trip.
 */
import { parseCookies, COOKIES, setSessionCookies, clearSessionCookies } from './cookies.js';
import { bearerToken, isNativeClient } from './http.js';
import * as sb from './supabase.js';

/**
 * @returns {Promise<{accessToken: string, user: object, transport: string}|null>}
 */
export async function resolveSession(req, res) {
  // --- Native: Authorization: Bearer <token> -------------------------------
  const bearer = bearerToken(req);
  if (bearer) {
    const me = await sb.getUser(bearer);
    if (me.ok && me.data?.id) {
      return { accessToken: bearer, user: me.data, transport: 'bearer' };
    }
    // Deliberately no cookie fallback: a native caller that sent a bearer token
    // is told 401 so it refreshes, rather than being silently downgraded.
    return null;
  }

  // --- Web: HttpOnly cookies ----------------------------------------------
  const cookies = parseCookies(req);
  const access = cookies[COOKIES.access];
  const refresh = cookies[COOKIES.refresh];

  if (access) {
    const me = await sb.getUser(access);
    if (me.ok && me.data?.id) {
      return { accessToken: access, user: me.data, transport: 'cookie' };
    }
  }

  if (refresh) {
    const refreshed = await sb.refreshSession(refresh);
    if (refreshed.ok && refreshed.data?.access_token) {
      setSessionCookies(res, refreshed.data);
      const me = await sb.getUser(refreshed.data.access_token);
      if (me.ok && me.data?.id) {
        return { accessToken: refreshed.data.access_token, user: me.data, transport: 'cookie' };
      }
    }
  }

  clearSessionCookies(res);
  return null;
}

/**
 * Hand a freshly created Supabase session to the caller in the only transport
 * that caller is allowed to use.
 *
 *   web    -> HttpOnly cookies are set on `res`; nothing secret enters the body.
 *   native -> the token pair is returned so the app can put it in the keychain.
 *
 * @returns {null|{access_token: string, refresh_token: string, expires_in: number, token_type: string}}
 */
export function issueSession(req, res, session) {
  if (isNativeClient(req)) {
    if (!session?.access_token) return null;
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
      expires_in: Number(session.expires_in) || 3600,
      token_type: 'bearer'
    };
  }

  setSessionCookies(res, session);
  return null;
}

/**
 * Role lookup. app_metadata.role wins because only an admin can write it,
 * whereas user_metadata is self-service and must never grant privileges.
 * This mirrors publicUser() and the RLS is_admin() helper.
 */
export function roleOf(user) {
  if (!user) return 'guest';
  return user.app_metadata?.role || user.user_metadata?.role || 'member';
}

export function isAdmin(user) {
  return roleOf(user) === 'admin';
}
