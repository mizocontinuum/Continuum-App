/**
 * Continuum Academy - browser-side configuration.
 *
 * Only NON-SECRET values live here: everything in this file is downloaded by
 * every visitor and is therefore public. Supabase's project URL, anon key and
 * all server secrets stay on the server (see server/lib/supabase.js) and are
 * never read from this file.
 *
 * TURNSTILE_SITE_KEY
 *   The Cloudflare Turnstile *site* key (the public half). Fill it in only when
 *   the matching TURNSTILE_SECRET_KEY is set on the server. When it is empty the
 *   captcha widget is not rendered and no `turnstileToken` is sent - which is
 *   correct, because the server skips verification when it has no secret.
 */

export const TURNSTILE_SITE_KEY = '';
