/**
 * Continuum Academy - API client.
 *
 * Every call to /api/* goes through here. Session tokens never touch this
 * module: the browser only ever receives HttpOnly cookies, so `credentials:
 * 'same-origin'` is all that is required to stay signed in.
 *
 * Errors are normalised into an Error with `status` and `data` so a caller can
 * distinguish "wrong password" (401) from "server down" (network throw).
 */

/**
 * Resolve an /api path from any page depth. Pages are one level deep
 * (`/login/`, `/home/`, ...), so `../api/...` is the site root; the same rule
 * store.js uses for its own links.
 */
function apiUrl(path) {
  return new URL(`../${String(path).replace(/^\//, '')}`, document.baseURI).href;
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (cause) {
    const error = new Error('Could not reach the sign-in service. Check your connection and try again.');
    error.status = 0;
    error.cause = cause;
    throw error;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error((data && data.error) || `Request failed (${response.status}).`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /** @returns {Promise<{user: object}>} throws 401 when there is no session. */
  getSession: () => request('api/auth/session'),

  login: (email, password, turnstileToken) =>
    request('api/auth/login', { method: 'POST', body: { email, password, turnstileToken } }),

  signup: (email, password, fullName, turnstileToken) =>
    request('api/auth/signup', { method: 'POST', body: { email, password, fullName, turnstileToken } }),

  logout: () => request('api/auth/logout', { method: 'POST' }),

  /** Second step of a 2FA sign-in; the server holds the aal1 token in a cookie. */
  mfaVerify: (code, factorId) =>
    request('api/auth/mfa/verify', { method: 'POST', body: { code, factorId } }),

  forgot: (email) => request('api/auth/forgot', { method: 'POST', body: { email } }),

  updatePassword: (password) =>
    request('api/auth/update-password', { method: 'POST', body: { password } }),

  /** Move recovery-link tokens out of the URL hash and into HttpOnly cookies. */
  adoptSession: (accessToken, refreshToken) =>
    request('api/auth/adopt-session', {
      method: 'POST',
      body: { access_token: accessToken, refresh_token: refreshToken }
    }),

  /** @returns {Promise<{url: string}>} the provider URL to navigate to. */
  oauth: (provider, next) =>
    request('api/auth/oauth', { method: 'POST', body: { provider, next } })
};
