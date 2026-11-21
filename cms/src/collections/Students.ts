import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'

/**
 * Learners. Authentication for students stays in Supabase; this collection is
 * the admin-facing directory (progress, enrolment, account status).
 */
export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'status', 'plan', 'createdAt'],
    group: 'People',
  },
  access: {
    read: authenticated,
    create: isAdmin,
    update: authenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'supabaseUserId',
      type: 'text',
      index: true,
      admin: {
        description: 'Links this record to the app auth user in Supabase.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      name: 'plan',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
    },
    {
      name: 'enrolledDisciplines',
      type: 'relationship',
      relationTo: 'disciplines',
      hasMany: true,
    },
    {
      name: 'joinedAt',
      type: 'date',
    },
    {
      name: 'lastActiveAt',
      type: 'date',
    },
    {
      name: 'progress',
      type: 'array',
      labels: {
        singular: 'Progress Entry',
        plural: 'Progress',
      },
      fields: [
        {
          name: 'video',
          type: 'relationship',
          relationTo: 'videos',
          required: true,
        },
        {
          name: 'percentComplete',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
        },
        {
          name: 'completedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal admin notes — never shown to the learner.',
      },
    },
  ],
  timestamps: true,
}
