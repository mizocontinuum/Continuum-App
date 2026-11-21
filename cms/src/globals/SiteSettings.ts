import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Global site configuration — branding, hero, featured content and SEO.
 * Read publicly so the static frontend can render it; editable by any CMS user.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            { name: 'siteName', type: 'text', defaultValue: 'Continuum Academy' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'favicon', type: 'upload', relationTo: 'media' },
            { name: 'accentColor', type: 'text', defaultValue: '#4cc3e0' },
          ],
        },
        {
          label: 'Hero',
          fields: [
            { name: 'heroTitle', type: 'text' },
            { name: 'heroSubtitle', type: 'textarea' },
            { name: 'heroVideoUrl', type: 'text' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'heroCtaLabel', type: 'text', defaultValue: 'Start Watching' },
            { name: 'heroCtaHref', type: 'text', defaultValue: '/home' },
          ],
        },
        {
          label: 'Featured',
          fields: [
            { name: 'featuredDiscipline', type: 'relationship', relationTo: 'disciplines' },
            { name: 'spotlightVideo', type: 'relationship', relationTo: 'videos' },
            { name: 'topTenLimit', type: 'number', defaultValue: 10, min: 1, max: 50 },
          ],
        },
        {
          label: 'Footer & Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                { name: 'platform', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
            { name: 'footerNote', type: 'textarea' },
          ],
        },
        {
          label: 'SEO Defaults',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
