import type { Access } from 'payload'

/**
 * Admins can act on anyone; every other user is scoped to their own document.
 * Returns a `Where` constraint so it also works for `read` queries.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as { role?: string }).role === 'admin') return true
  return { id: { equals: user.id } }
}
