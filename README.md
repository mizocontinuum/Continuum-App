# Continuum Academy

Executive-learning cockpit: a mobile-first **static** website (no build step, no
bundler, no backend) built with plain HTML, CSS and native ES modules.

Open `index.html` directly in a browser, or drop the folder on any static host
(GitHub Pages, Netlify, Cloudflare Pages, S3, …). There is nothing to install
and nothing to configure.

```
/                 landing
/login/ /signup/  /forgot-password/ /reset-password/   auth
/home/            dashboard
/explore/ /library/ /search/ /clips/ /disciplines/ /discipline/   discovery
/watch/?video=..  masterclass playback
/profile/ /admin/ account + admin console
```

## Architecture

There is no server and no database. Every page renders complete, realistic
content from a local data module the moment it loads.

| Layer     | Location                                                              |
| --------- | --------------------------------------------------------------------- |
| Pages     | `/<page>/index.html`                                                  |
| Styles    | `assets/css/base/*` (tokens, reset, auth), `assets/css/pages/*.css`, `assets/css/components/*` |
| Frontend  | `assets/js/pages/<page>.js` (ES modules, `createElement` + `replaceChildren`) |
| Data      | `assets/js/mock-data.js` — disciplines, masterclasses, profile, notifications |
| State     | `assets/js/store.js` — a synchronous `localStorage` wrapper          |
| PWA       | `manifest.json`, `sw.js` (asset-only cache), `assets/js/pwa.js`       |

**Data model.** `mock-data.js` holds the catalogue (`disciplines`, `videos`),
the seed favourites/progress and the notification feed. `store.js` is the only
module that touches `localStorage`: it exposes favourites, playback progress,
the local session, the profile and admin edits as synchronous functions, and
falls back to the mock seed whenever nothing has been stored yet.

**Sign-in.** `login/`, `signup/`, `forgot-password/` and `reset-password/` are
all backed by `assets/js/pages/auth.js`. Signing in simply records which demo
account is active in this browser — there is no network request, no cookie, no
CAPTCHA and no second factor. One-tap demo buttons sign in as a member or an
administrator; the page guard in `assets/js/user-menu.js` reads
`data-requires-auth` / `data-requires-admin` on `<html>`.

## Content security

| Variable                    | Required | Purpose                                              |
| --------------------------- | -------- | ---------------------------------------------------- |
| `SUPABASE_URL`              | yes      | Supabase project URL                                 |
| `SUPABASE_ANON_KEY`         | yes      | Public anon key, used as the server-side `apikey`    |
| `TURNSTILE_SECRET_KEY`      | yes      | Cloudflare Turnstile secret for login/signup CAPTCHA |
| `UPSTASH_REDIS_REST_URL`    | yes      | Upstash REST URL for rate limiting                   |
| `UPSTASH_REDIS_REST_TOKEN`  | yes      | Upstash REST token                                   |
| `SUPABASE_JWT_SECRET`       | legacy   | Only if the project still uses HS256 signing keys    |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Privileged admin ops only. Never expose to client    |

The three Supabase auth URLs (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) and the
Turnstile site key that the browser needs are read from `assets/js/config.js`
(non-secret) — never from the environment.

## Supabase setup

1. **Run the SQL, in this order, in the SQL Editor (Dashboard → SQL → New query):**
   1. [supabase/rls-policies.sql](supabase/rls-policies.sql) — catalogue tables,
      `public.is_admin()`, and their policies.
   2. [supabase/user-schema.sql](supabase/user-schema.sql) — `profiles`,
      `progress`, `favorites`, `notifications`, their RLS, the
      `videos.video_url` column, and the `on_auth_user_created` trigger that
      inserts a `profiles` row on signup.
   Both scripts are idempotent — running them again changes nothing.

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
[supabase/rls-policies.sql](supabase/rls-policies.sql):

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
modules. The service worker (`sw.js`) precaches the app shell with a
network-first strategy and explicitly never caches `/api/*`.

## Smoke test

[scripts/smoke.sh](scripts/smoke.sh) runs cheap unauthenticated curl checks
against a deployed origin:

```bash
BASE_URL=https://<your-domain> scripts/smoke.sh
```

It asserts that `/api/auth/session`, `/api/catalog`, and `/api/user/progress`
return `401` without a session, and that `/login/` returns `200`. The same
script runs after every deploy via
[.github/workflows/smoke.yml](.github/workflows/smoke.yml) (set the
`PRODUCTION_URL` repository variable to enable it).

## Security headers

`vercel.json` sets a strict Content-Security-Policy. In particular,
`script-src 'self'` **forbids inline `<script>` bodies and inline event
handlers** — every listener is wired inside the page's ES module. `style-src`
allows `'unsafe-inline'` so the markup can carry one-off style attributes.

## Local development

No install, no build. Serve the folder with any static server so that ES
module imports and the service worker work (opening `file://` also works for
browsing, but the service worker is skipped outside a secure context):

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```
