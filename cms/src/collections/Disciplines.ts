import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { slugField } from '../fields/slug'

/**
 * Disciplines (a.k.a. categories) — the executive learning verticals that
 * drive the "one row per discipline" layout on the home page.
 */
export const Disciplines: CollectionConfig = {
  slug: 'disciplines',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'featured', 'status'],
    group: 'Catalog',
  },
  access: {
    read: publishedOrLoggedIn,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon key or emoji, e.g. "chart" or "📈".',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#4cc3e0',
      admin: {
        description: 'Continuum accent — cyan by default.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
  timestamps: true,
}
