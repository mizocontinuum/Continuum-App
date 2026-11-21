import type { Access } from 'payload'

/** Only users whose `role` is `admin`. */
export const isAdmin: Access = ({ req: { user } }) =>
  Boolean(user && (user as { role?: string }).role === 'admin')
