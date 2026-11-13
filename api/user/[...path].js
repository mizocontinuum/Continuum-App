/**
 * User data route dispatcher.
 *
 * Vercel Hobby limits each deployment to 12 serverless functions. Keep the
 * /api/user/* URLs while routing them through this single function, mirroring
 * the auth dispatcher in api/auth/[...path].js.
 */
import { fail, apiHandler } from '../../server/lib/http.js';
import favorites from '../../server/user/favorites.js';
import notifications from '../../server/user/notifications.js';
import profile from '../../server/user/profile.js';
import progress from '../../server/user/progress.js';

const handlers = {
  favorites,
  notifications,
  profile,
  progress
};

function getRoute(req) {
  const pathname = new URL(req.url || '/', 'https://internal').pathname;
  return pathname.replace(/^\/api\/user\/?/, '').replace(/\/+$/, '');
}

async function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];
  if (!routeHandler) return fail(res, 404, 'User endpoint not found.');
  return routeHandler(req, res);
}

export default apiHandler(handler);
