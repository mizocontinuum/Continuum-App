# Continuum Academy

Executive-learning cockpit: a mobile-first website built with plain HTML, CSS
and native ES modules, backed by a small set of Vercel serverless functions that
handle authentication and user data on Supabase.

There is no build step and no bundler — `assets/js/*.js` reach the browser
exactly as they are written. The pages themselves are static, so they render on
any host; the `/api/*` routes need a host that runs the Node functions (Vercel,
or `vercel dev` for local work).

```
/                 landing
/login/ /signup/  /forgot-password/ /reset-password/   auth
/home/            dashboard
/explore/ /library/ /search/ /clips/ /disciplines/ /discipline/   discovery
/watch/?video=..  masterclass playback
/profile/ /admin/ account + admin console
```

## Architecture

| Layer     | Location                                                              |
| --------- | --------------------------------------------------------------------- |
| Pages     | `/<page>/index.html`                                                  |
| Styles    | `assets/css/base/*` (tokens, reset, auth), `assets/css/pages/*.css`, `assets/css/components/*` |
| Frontend  | `assets/js/pages/<page>.js` (ES modules, `createElement` + `replaceChildren`) |
| API client| `assets/js/api.js` — every `/api/*` call, with `credentials: 'same-origin'` |
| Catalogue | `assets/js/mock-data.js` — disciplines, masterclasses, notifications  |
| State     | `assets/js/store.js` — the session mirror + a `localStorage` catalogue wrapper |
| Backend   | `api/**` (routers) + `server/**` (handlers), hosted on Vercel         |
| Guard     | `middleware.js` (Edge) + `assets/js/user-menu.js` (client)            |
| PWA       | `manifest.json`, `sw.js` (asset-only cache), `assets/js/pwa.js`       |

**Authentication.** `login/`, `signup/`, `forgot-password/` and
`reset-password/` are backed by `assets/js/pages/auth.js`, which talks to the
real endpoints: `POST /api/auth/{login,signup,forgot,logout,update-password,
oauth,adopt-session}` and `GET /api/auth/session`. Tokens are held by the server
in `HttpOnly`, `__Host-`-prefixed cookies and never reach client JavaScript.
`store.js` keeps only a public mirror of the user (name, email, role) so the
chrome can paint before the network answers.

**The guard.** `middleware.js` protects `/home`, `/library`, `/explore`,
`/search`, `/discipline(s)`, `/clips`, `/profile` and `/admin` at the edge by
verifying the session JWT. Pages are belt-and-braces: each gated page awaits
`initPageChrome()`, which re-checks `GET /api/auth/session` and enforces
`data-requires-auth` / `data-requires-admin` on `<html>`. Signing out calls
`POST /api/auth/logout`, which revokes the refresh token and clears the cookies,
so the next account starts clean.

**Data model.** The catalogue, favourites, playback progress and notifications
still render from `mock-data.js`/`store.js`; the matching `/api/catalog` and
`/api/user/*` endpoints exist but the pages are not wired to them yet.

## Environment variables

| Variable                    | Required    | Purpose                                              |
| --------------------------- | ----------- | ---------------------------------------------------- |
| `SUPABASE_URL`              | yes         | Supabase project URL                                 |
| `SUPABASE_ANON_KEY`         | yes         | Public anon key, used as the server-side `apikey`    |
| `TURNSTILE_SECRET_KEY`      | recommended | Cloudflare Turnstile secret for login/signup CAPTCHA |
| `UPSTASH_REDIS_REST_URL`    | recommended | Upstash REST URL for rate limiting                   |
| `UPSTASH_REDIS_REST_TOKEN`  | recommended | Upstash REST token                                   |
| `SUPABASE_JWT_SECRET`       | legacy      | Only if the project still uses HS256 signing keys    |
| `SUPABASE_SERVICE_ROLE_KEY` | optional    | Privileged admin ops only. Never expose to client    |

Turnstile and Upstash are optional: without them the CAPTCHA is skipped and
rate limiting is disabled, so sign-in still works (which keeps local and preview
environments usable). Enable both before going to production.

The only browser-side value is the Turnstile **site** key, which lives in
`assets/js/config.js` (non-secret, public by design). Leave it empty to disable
the CAPTCHA. Every Supabase credential stays server-side in the environment.

## Supabase setup

1. **Run the SQL, in this order, in the SQL Editor (Dashboard → SQL → New query):**
   1. [supabase/01-catalog.sql](supabase/01-catalog.sql) — `disciplines`,
      `speakers`, `videos`, `public.is_admin()` and their read/admin policies.
   2. [supabase/02-user-data.sql](supabase/02-user-data.sql) — `profiles`,
      `progress`, `favorites`, `notifications`, their owner-scoped RLS, and the
      `on_auth_user_created` trigger that inserts a `profiles` row on signup.
   3. [supabase/03-seed-catalog.sql](supabase/03-seed-catalog.sql) — the 7
      disciplines, 10 speakers and 28 videos the catalogue pages expect.
   Every script is idempotent — running it again changes nothing.
   [supabase/00-reset-catalog.sql](supabase/00-reset-catalog.sql) is a
   **destructive** one-off, needed only when an older uuid-keyed catalogue is
   still present and `01-catalog.sql` refuses to run.

2. **Redirect URLs** (Dashboard → Authentication → URL Configuration). Add the
   production and preview origins plus localhost for development:

   ```
   https://<your-domain>/**
   https://*-<your-vercel-team>.vercel.app/**
   http://localhost:3000/**
   ```

   The app returns to `/api/auth/callback` after OAuth; that path is built
   server-side from the incoming request origin, so no per-environment value
   needs to be hard-coded.

3. **Email templates / magic link** use the same redirect allow-list.

### Implicit vs PKCE

This app uses the **authorization-code + PKCE** flow, not the implicit flow.

- All auth is mediated by `/api/auth/*` on the server, so there is nowhere on
  the client to safely keep an implicit-flow access token.
- `server/lib/supabase.js` mints a PKCE `code_verifier`, stores it in a short
  lived HttpOnly cookie, and `server/auth/callback.js` exchanges the returned
  `code` for a session. Tokens are written to HttpOnly cookies and never touch
  client JS.
- Implicit would deliver tokens in the URL fragment to the browser — exactly
  what this architecture is designed to avoid.

Do **not** set the redirect URL to a page that expects a hash fragment; keep
the code-based `/api/auth/callback` endpoint.

The short-lived PKCE cookie is deliberately `SameSite=Lax` (the only cookie
that is not `Strict`): the provider returns via a cross-site top-level
navigation, and a `Strict` cookie would be withheld there, breaking every
sign-in. Session cookies remain `Strict`.

### Promoting an admin

Admin is `app_metadata.role`, which only an admin/service role can write.
Uncomment and run the block at the bottom of
[supabase/01-catalog.sql](supabase/01-catalog.sql):

```sql
update auth.users
   set raw_app_meta_data =
         coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
 where email = 'admin@continuum.com.ph';
```

Then sign out and back in so the refreshed JWT carries the claim.

## Serverless function budget

Vercel Hobby allows **12** serverless functions per deployment. We use
**5**, because every API area is a single catch-all router rather than one
function per endpoint:

| Function                     | Routes                                            |
| ---------------------------- | ------------------------------------------------- |
| `api/auth/[...path].js`      | `/api/auth/*` (login, signup, oauth, callback, mfa, …) |
| `api/user/[...path].js`      | `/api/user/{progress,favorites,notifications,profile}` |
| `api/catalog.js`             | `/api/catalog` (list · `?q=` search · `?id=`)     |
| `api/admin/disciplines.js`   | `/api/admin/disciplines`                          |
| `api/admin/videos.js`        | `/api/admin/videos`                               |

**When adding endpoints, extend an existing router — do not add a new file.**
`middleware.js` (Edge) and `api/**` handlers are counted differently; the Edge
middleware does not consume the serverless function budget.

## Local development & deploy

```bash
npm install          # only for the server deps (jose, upstash, @vercel/edge)
vercel dev           # runs the static site + /api functions on :3000
vercel --prod        # deploy
```

There is no build step and no bundler: `assets/js/*.js` are served as native ES
modules. The service worker (`sw.js`) serves non-API traffic cache-first with a
network fallback, and never caches `/api/*` — a cached session or a cached `401`
would be worse than a slow load. Bump `CACHE_NAME` whenever the shell changes.

`npm install` is only needed for the serverless dependencies; the static pages
themselves have no dependencies at all.

### Debugging in VS Code

`.vscode/launch.json` ships three configurations, all pointed at `:3000` so the
debugged origin matches whatever is serving the site:

| Configuration                       | Dev server                | Use for                                     |
| ----------------------------------- | ------------------------- | ------------------------------------------- |
| Debug app (static, python3)         | `python3 -m http.server`  | Page/module work with no backend            |
| Debug app (vercel dev, full API)    | `vercel dev --listen 3000`| Anything touching `/api/*` (sign-in, data)  |
| Attach to Chrome (port 9222)        | you start it yourself     | Attaching to a server already running       |

F5 starts the matching task from `.vscode/tasks.json` and launches Chrome, so
breakpoints in `assets/js/**` resolve against the served files. The static task
serves the same paths as production (`/login/` → `login/index.html`) but has no
`/api/*` functions — gated pages will redirect to `/login/`. Use the `vercel dev`
configuration for auth work; it needs Node.js 22.x and the Vercel CLI on `PATH`.

## Smoke test

[scripts/smoke.sh](scripts/smoke.sh) runs cheap unauthenticated curl checks
against a deployed origin:

```bash
BASE_URL=https://<your-domain> scripts/smoke.sh
```

It asserts that `/api/auth/session`, `/api/catalog`, and `/api/user/progress`
return `401` without a session, and that `/login/` returns `200`. Run it after
every deploy.

## Security headers

`vercel.json` sets a strict Content-Security-Policy, and `_headers` mirrors the
same policy for non-Vercel static hosts. In particular, `script-src` allows only
`'self'` plus the Cloudflare Turnstile origin, which **forbids inline
`<script>` bodies and inline event handlers** — every listener is wired inside
the page's ES module. `style-src` allows `'unsafe-inline'` so the markup can
carry one-off style attributes.

## Browsing without a backend

The pages are plain files, so the landing page and the static catalogue render
over `file://` or any static server. Sign-in, however, needs the `/api/*`
functions, so use `vercel dev` for anything past the landing page.
