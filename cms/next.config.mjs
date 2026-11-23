import { withPayload } from '@payloadcms/next/withPayload'

// Static site pages that ship inside /public as <name>/index.html.
// Payload owns /admin and /api, so those paths are intentionally excluded.
const STATIC_PAGES = [
  'clips',
  'discipline',
  'disciplines',
  'explore',
  'forgot-password',
  'home',
  'library',
  'login',
  'profile',
  'reset-password',
  'search',
  'signup',
  'watch',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    // Payload owns the real admin. Route the retired localStorage demo there.
    return [
      { source: '/admin/', destination: '/admin', permanent: false },
      { source: '/dashboard', destination: '/admin', permanent: false },
      { source: '/dashboard/', destination: '/admin', permanent: false },
    ]
  },

  async rewrites() {
    // Pretty URLs -> the matching static index.html in /public.
    // Trailing-slash variants are listed too, so the site's "/login/" style
    // links resolve regardless of Next's slash normalisation.
    const rules = [{ source: '/', destination: '/index.html' }]
    for (const page of STATIC_PAGES) {
      rules.push({ source: `/${page}`, destination: `/${page}/index.html` })
      rules.push({ source: `/${page}/`, destination: `/${page}/index.html` })
    }
    return { beforeFiles: [], afterFiles: rules, fallback: [] }
  },
}

// The Continuum CMS is its own Next.js app: it serves the static site from
// /public and the Payload admin/API from /admin and /api on the same domain.
export default withPayload(nextConfig, { devBundleServerPackages: false })
