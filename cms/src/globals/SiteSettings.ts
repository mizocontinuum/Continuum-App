import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

/**
 * Global site configuration — branding, landing page, featured content and SEO.
 * Publicly readable, but only CMS admins may publish changes.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: anyone,
    update: isAdmin,
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
            { name: 'heroTitle', type: 'text', admin: { hidden: true } },
            { name: 'heroVideoUrl', type: 'text', admin: { hidden: true } },
            { name: 'heroEyebrow', type: 'text', defaultValue: 'The Performance Learning Academy' },
            { name: 'heroTitleLead', type: 'text', defaultValue: 'Learn how the best' },
            { name: 'heroTitleAccent', type: 'text', defaultValue: 'lead, build and grow' },
            { name: 'heroTitleTail', type: 'text', defaultValue: '.' },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              defaultValue:
                'Stream masterclasses from founders and operators who have done it before. One discipline at a time, built for the decisions you face this quarter.',
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'heroCtaLabel', type: 'text', defaultValue: 'Enter the Academy' },
            { name: 'heroCtaHref', type: 'text', defaultValue: '#disciplinesSection' },
            { name: 'heroSecondaryCtaLabel', type: 'text', defaultValue: 'Create a free account' },
            { name: 'heroSecondaryCtaHref', type: 'text', defaultValue: 'signup/' },
            { name: 'signInLabel', type: 'text', defaultValue: 'Sign in' },
            {
              name: 'heroLayout',
              type: 'group',
              fields: [
                {
                  name: 'textAlignment',
                  type: 'select',
                  defaultValue: 'center',
                  options: [
                    { label: 'Center', value: 'center' },
                    { label: 'Left', value: 'left' },
                  ],
                },
                { name: 'heightDesktop', type: 'number', defaultValue: 92, min: 60, max: 110 },
                { name: 'heightMobile', type: 'number', defaultValue: 70, min: 55, max: 100 },
                { name: 'titleSizeDesktop', type: 'number', defaultValue: 64, min: 32, max: 96 },
                { name: 'titleSizeMobile', type: 'number', defaultValue: 36, min: 24, max: 60 },
                { name: 'contentMaxWidth', type: 'number', defaultValue: 1200, min: 600, max: 1600 },
                { name: 'backgroundPositionX', type: 'number', defaultValue: 75, min: 0, max: 100 },
                { name: 'backgroundPositionY', type: 'number', defaultValue: 50, min: 0, max: 100 },
                { name: 'overlayOpacity', type: 'number', defaultValue: 58, min: 0, max: 90 },
                { name: 'showEyebrow', type: 'checkbox', defaultValue: true },
                { name: 'showPrimaryCta', type: 'checkbox', defaultValue: true },
                { name: 'showSecondaryCta', type: 'checkbox', defaultValue: true },
                { name: 'showGrid', type: 'checkbox', defaultValue: true },
                { name: 'showAnimatedEmblem', type: 'checkbox', defaultValue: true },
              ],
            },
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
