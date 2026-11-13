/**
 * Vercel Edge Middleware - server-side route protection.
 *
 * Runs BEFORE any protected static page is served, so the browser can no longer
 * bypass the guard by disabling JavaScript. Admin routes additionally require a
 * verified `role: admin` claim.
 */
import { next } from '@vercel/edge';
import { jwtVerify, createRemoteJWKSet } from 'jose';

export const config = {
  matcher: [
    '/home/:path*',
    '/library/:path*',
    '/explore/:path*',
    '/search/:path*',
    '/discipline/:path*',
    '/disciplines/:path*',
    '/clips/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ]
};

const ACCESS_COOKIE = '__Host-ca-access';
const REFRESH_COOKIE = '__Host-ca-refresh';

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return part.slice(idx + 1).trim();
      }
    }
  }
  return null;
}

async function verifyAccessToken(token) {
  const supabaseUrl = process.env.SUPABASE_URL;
  // Asymmetric signing keys (newer Supabase projects) - verified via public JWKS.
  if (supabaseUrl) {
    try {
      const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, jwks);
      return payload;
    } catch {
      /* fall through to the symmetric check */
    }
  }
  // Legacy symmetric (HS256) signing key.
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
      return payload;
    } catch {
      return null;
    }
  }
  return null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const cookieHeader = request.headers.get('cookie');

  const accessToken = readCookie(cookieHeader, ACCESS_COOKIE);
  const refreshToken = readCookie(cookieHeader, REFRESH_COOKIE);

  const claims = accessToken ? await verifyAccessToken(accessToken) : null;

  // No usable session at all -> send to login (remembering where they were going).
  if (!claims && !refreshToken) {
    const loginUrl = new URL('/login/', url);
    loginUrl.searchParams.set('redirect', path);
    return Response.redirect(loginUrl, 302);
  }

  // Admin gate, enforced only when we have verified claims.
  if (claims && path.startsWith('/admin')) {
    // app_metadata is writable only by an admin, so it must take precedence
    // over the self-service user_metadata (same rule as publicUser / RLS).
    const role = claims.app_metadata?.role || claims.user_metadata?.role;
    if (role !== 'admin') {
      return Response.redirect(new URL('/home/', url), 302);
    }
  }

  // Authenticated (or has a refresh token that /api/auth/session will exchange).
  return next();
}
