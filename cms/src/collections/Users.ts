import type { CollectionConfig } from 'payload'

import type { CollectionBeforeValidateHook } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminFieldLevel } from '../access/isAdminFieldLevel'
import { isAdminOrSelf } from '../access/isAdminOrSelf'

/**
 * CMS operators (admins / editors / viewers).
 * Learner accounts live in the separate `students` collection.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    group: 'Access Control',
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || req.user) return data
        const existingUsers = await req.payload.find({
          collection: 'users',
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        return existingUsers.totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ] satisfies CollectionBeforeValidateHook[],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      // Persist the role in the JWT so access checks avoid a DB round-trip.
      saveToJWT: true,
      access: {
        // Only admins may grant or change roles.
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Job title shown in the admin UI.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  timestamps: true,
}
