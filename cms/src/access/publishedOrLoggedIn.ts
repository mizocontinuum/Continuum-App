import type { Access } from 'payload'

/**
 * Anonymous visitors may only read `published` documents; authenticated
 * operators can read everything (drafts, scheduled, archived).
 * Returned as a `Where` clause so drafts never leak through the public API.
 */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    status: {
      equals: 'published',
    },
  }
}
