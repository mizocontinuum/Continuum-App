/**
 * Auth route dispatcher.
 *
 * Vercel Hobby limits each deployment to 12 serverless functions. Keep the
 * existing /api/auth/* URLs while routing them through this single function.
 *
 * Sign-in methods: email + password, Google, Facebook. Password recovery is
 * included because it is part of the email/password flow.
 */
import { fail, apiHandler } from '../../server/lib/http.js';
import adoptSession from '../../server/auth/adopt-session.js';
import callback from '../../server/auth/callback.js';
import forgot from '../../server/auth/forgot.js';
import login from '../../server/auth/login.js';
import logout from '../../server/auth/logout.js';
import oauth from '../../server/auth/oauth.js';
import oauthExchange from '../../server/auth/oauth-exchange.js';
import profile from '../../server/auth/profile.js';
import refresh from '../../server/auth/refresh.js';
import session from '../../server/auth/session.js';
import signup from '../../server/auth/signup.js';
import updatePassword from '../../server/auth/update-password.js';
import enrollMfa from '../../server/auth/mfa/enroll.js';
import verifyMfa from '../../server/auth/mfa/verify.js';
import unenrollMfa from '../../server/auth/mfa/unenroll.js';

const handlers = {
  'adopt-session': adoptSession,
  callback,
  forgot,
  login,
  logout,
  oauth,
  'oauth/exchange': oauthExchange,
  profile,
  refresh,
  session,
  signup,
  'update-password': updatePassword,
  'mfa/enroll': enrollMfa,
  'mfa/verify': verifyMfa,
  'mfa/unenroll': unenrollMfa
};

function getRoute(req) {
  const pathname = new URL(req.url || '/', 'https://internal').pathname;
  return pathname.replace(/^\/api\/auth\/?/, '').replace(/\/+$/, '');
}

async function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];
  if (!routeHandler) return fail(res, 404, 'Auth endpoint not found.');
  return routeHandler(req, res);
}

export default apiHandler(handler);
