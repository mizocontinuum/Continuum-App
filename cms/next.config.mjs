import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// The Continuum CMS is its own Next.js app. The static site consumes it
// through the REST (`/api`) and GraphQL (`/api/graphql`) endpoints.
export default withPayload(nextConfig, { devBundleServerPackages: false })
