/**
 * Sliding-window rate limiting via Upstash Redis.
 *
 * Degrades gracefully: if Upstash is not configured (or unreachable) requests
 * are allowed, so a missing env var never locks users out of the app.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter;

function getLimiter() {
  if (limiter !== undefined) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'continuum_rl',
    analytics: false
  });
  return limiter;
}

/**
 * @returns {Promise<{success: boolean, configured: boolean, remaining?: number, reset?: number}>}
 */
export async function rateLimit(key) {
  const instance = getLimiter();
  if (!instance) return { success: true, configured: false };
  try {
    const result = await instance.limit(key);
    return {
      success: result.success,
      configured: true,
      remaining: result.remaining,
      reset: result.reset
    };
  } catch (err) {
    console.error('Rate limit check failed (allowing request):', err?.message || err);
    return { success: true, configured: false };
  }
}
