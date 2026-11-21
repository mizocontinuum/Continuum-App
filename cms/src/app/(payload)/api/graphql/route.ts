import config from '@payload-config'
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes'

export const POST = GRAPHQL_POST(config)
export const OPTIONS = REST_OPTIONS(config)

// Vercel serverless: allow long-running GraphQL requests (max for Hobby is 60s).
export const maxDuration = 60

// Never cache API responses — always serve fresh content.
export const dynamic = 'force-dynamic'
