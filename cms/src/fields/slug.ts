import type { Field } from 'payload'

/** Normalise arbitrary text into a URL-safe slug. */
export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Reusable slug field. Auto-generates from `sourceField` on create and
 * normalises manual edits, but always stays overridable.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from the title. Edit to override.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, operation }) => {
        if (typeof value === 'string' && value.length > 0) {
          return formatSlug(value)
        }
        const source = data?.[sourceField]
        if (operation === 'create' && typeof source === 'string') {
          return formatSlug(source)
        }
        return value
      },
    ],
  },
})
