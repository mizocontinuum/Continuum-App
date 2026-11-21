import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Disciplines } from './collections/Disciplines'
import { Media } from './collections/Media'
import { Students } from './collections/Students'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Browser origins allowed to call the CMS API. Keep the static app's deployed
// origin(s) in here (see FRONTEND_URLS in .env).
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const plugins: Plugin[] = []

// Persist uploads to Vercel Blob in production (serverless filesystems are
// ephemeral). Locally, leave the token unset and files land in /media.
if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  )
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Continuum Control',
      description: 'Admin control panel for Continuum Academy.',
    },
  },

  collections: [Users, Students, Disciplines, Videos, Media],
  globals: [SiteSettings],

  cors: allowedOrigins,
  csrf: allowedOrigins,

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Auto-create / sync tables on first boot so a fresh deploy is immediately
    // usable for testing. Once the schema is stable, turn this off and use
    // `payload migrate` (see README / scripts) for controlled migrations.
    push: true,
  }),

  sharp,

  plugins,
})
