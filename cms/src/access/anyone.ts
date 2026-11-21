import type { Access } from 'payload'

/** Publicly readable — used by the static frontend for published content. */
export const anyone: Access = () => true
