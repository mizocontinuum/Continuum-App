import type { Access } from 'payload'

/** Any logged-in CMS user (admin, editor or viewer). */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
