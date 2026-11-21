import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { slugField } from '../fields/slug'

/**
 * Videos / Masterclasses — the core catalogue content.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Masterclass',
    plural: 'Masterclasses',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'discipline', 'status', 'featured', 'publishedAt'],
    group: 'Catalog',
  },
  access: {
    read: publishedOrLoggedIn,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'discipline',
      type: 'relationship',
      relationTo: 'disciplines',
      required: true,
    },
    {
      name: 'speaker',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short executive summary shown on cards.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'previewClipUrl',
      type: 'text',
      admin: {
        description: 'Vertical trailer / 1-minute clip URL.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'HLS manifest or MP4 source.',
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      min: 0,
    },
    {
      name: 'targetOutcome',
      type: 'textarea',
      admin: {
        description: 'The outcome the learner should achieve.',
      },
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'executive',
      options: [
        { label: 'Foundation', value: 'foundation' },
        { label: 'Executive', value: 'executive' },
        { label: 'Advanced', value: 'advanced' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'modules',
      type: 'array',
      labels: {
        singular: 'Module',
        plural: 'Modules',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'durationMinutes', type: 'number', min: 0 },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Include in the home page spotlight / Top 10.',
      },
    },
    {
      name: 'isPremium',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Managed by frontend telemetry.',
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
