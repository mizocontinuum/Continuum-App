import type { FieldAccess } from 'payload'

/** Field-level guard — only admins may read/write a protected field (e.g. `role`). */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  Boolean(user && (user as { role?: string }).role === 'admin')
