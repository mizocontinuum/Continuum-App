/**
 * Continuum CMS — API client
 * ---------------------------------------------------------------------------
 * Dependency-free ES module for reading published content from the Payload
 * CMS. Imported by page modules, e.g.:
 *
 *   import { getDisciplines, getVideos, groupVideosByDiscipline } from '../lib/cms.js'
 *
 * Contract:
 *  - Never throws. Every function resolves to a safe default ([] / null / '')
 *    on missing config, network failure, timeout, non-2xx or malformed JSON.
 *  - Published-only: anonymous reads are constrained to `status = published`.
 *    The CMS enforces this server-side as well.
 *  - CSP-safe: no inline scripts, no eval, no third-party dependencies.
 *
 * Configure the base URL in one of these ways (first match wins):
 *   1. configure({ baseUrl: 'https://cms.example.com' })
 *   2. <meta name="cms-api-base" content="https://cms.example.com">
 *   3. window.CONTINUUM_CMS = { baseUrl: 'https://cms.example.com', timeout: 10000, silent: false }
 *   4. window.__CMS_BASE_URL__ = 'https://cms.example.com'
 *
 * If no base URL is resolved, reads resolve to empty values and a single
 * console warning is emitted (suppress it with `configure({ silent: true })`).
 */

/**
 * @typedef {Object} MediaSize
 * @property {string} [url]
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} Media
 * @property {number|string} [id]
 * @property {string} [url]
 * @property {string} [alt]
 * @property {string} [caption]
 * @property {number} [width]
 * @property {number} [height]
 * @property {Record<string, MediaSize>} [sizes]
 */

/**
 * @typedef {Object} Discipline
 * @property {number|string} [id]
 * @property {string} title
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [accentColor]
 * @property {string} [status]
 * @property {boolean} [featured]
 * @property {number} [order]
 * @property {Media|number|string|null} [heroImage]
 */

/**
 * @typedef {Object} VideoModule
 * @property {string} [id]
 * @property {string} title
 * @property {string} [description]
 * @property {number} [durationMinutes]
 */

/**
 * @typedef {Object} Video
 * @property {number|string} [id]
 * @property {string} title
 * @property {string} slug
 * @property {Discipline|number|string|null} [discipline]
 * @property {{ name?: string, title?: string, avatar?: Media|number|string|null }} [speaker]
 * @property {string} [summary]
 * @property {unknown} [description]
 * @property {Media|number|string|null} [thumbnail]
 * @property {string} [previewClipUrl]
 * @property {string} [videoUrl]
 * @property {number} [durationMinutes]
 * @property {string} [targetOutcome]
 * @property {string} [level]
 * @property {{ tag: string }[]} [tags]
 * @property {VideoModule[]} [modules]
 * @property {string} [status]
 * @property {string} [publishedAt]
 * @property {boolean} [featured]
 * @property {boolean} [isPremium]
 * @property {number} [views]
 */

/**
 * @typedef {Object} SiteSettings
 * @property {string} [siteName]
 * @property {Media|number|string|null} [logo]
 * @property {Media|number|string|null} [favicon]
 * @property {string} [accentColor]
 * @property {string} [heroTitle]
 * @property {string} [heroSubtitle]
 * @property {string} [heroVideoUrl]
 * @property {Media|number|string|null} [heroImage]
 * @property {string} [heroCtaLabel]
 * @property {string} [heroCtaHref]
 * @property {Discipline|number|string|null} [featuredDiscipline]
 * @property {Video|number|string|null} [spotlightVideo]
 * @property {number} [topTenLimit]
 * @property {{ platform: string, url: string }[]} [socialLinks]
 * @property {string} [footerNote]
 * @property {string} [metaTitle]
 * @property {string} [metaDescription]
 * @property {Media|number|string|null} [ogImage]
 */

/**
 * @template T
 * @typedef {Object} Page
 * @property {T[]} docs
 * @property {number} totalDocs
 * @property {number} totalPages
 * @property {number} page
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

const DEFAULT_TIMEOUT = 10000
const DEFAULT_LIMIT = 100

const state = {
  baseUrl: '',
  timeout: DEFAULT_TIMEOUT,
  silent: false,
  resolved: false,
  warned: false,
}

/** @param {unknown} value */
function warn(value) {
  if (state.silent || state.warned) return
  state.warned = true
  try {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn('[cms]', value)
    }
  } catch (_) {
    /* console unavailable */
  }
}

/** @param {string} url */
function normalizeBase(url) {
  if (typeof url !== 'string') return ''
  return url.trim().replace(/\/+$/, '')
}

/** @returns {string} */
function detectBaseUrl() {
  try {
    if (typeof window === 'undefined') return ''

    const config = /** @type {any} */ (window).CONTINUUM_CMS
    if (config && typeof config.baseUrl === 'string' && config.baseUrl) {
      return config.baseUrl
    }

    if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      const meta = document.querySelector('meta[name="cms-api-base"]')
      const content = meta && typeof meta.getAttribute === 'function' ? meta.getAttribute('content') : ''
      if (content) return content
    }

    const legacy = /** @type {any} */ (window).__CMS_BASE_URL__
    if (typeof legacy === 'string' && legacy) return legacy
  } catch (_) {
    /* ignore and fall through */
  }
  return ''
}

/** Resolve config lazily so importing this module never throws. */
function ensureResolved() {
  if (state.resolved) return
  state.resolved = true

  if (!state.baseUrl) {
    state.baseUrl = detectBaseUrl()
  }
  state.baseUrl = normalizeBase(state.baseUrl)

  try {
    const config = typeof window !== 'undefined' ? /** @type {any} */ (window).CONTINUUM_CMS : null
    if (config) {
      if (typeof config.timeout === 'number' && config.timeout >= 0) state.timeout = config.timeout
      if (config.silent === true) state.silent = true
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * Override configuration at runtime.
 * @param {{ baseUrl?: string, timeout?: number, silent?: boolean }} [options]
 */
export function configure(options = {}) {
  ensureResolved()
  if (typeof options.baseUrl === 'string') state.baseUrl = normalizeBase(options.baseUrl)
  if (typeof options.timeout === 'number' && options.timeout >= 0) state.timeout = options.timeout
  if (typeof options.silent === 'boolean') state.silent = options.silent
  state.resolved = true
  state.warned = false
}

/** @returns {boolean} */
export function isConfigured() {
  ensureResolved()
  return Boolean(state.baseUrl)
}

/** @returns {string} */
export function getBaseUrl() {
  ensureResolved()
  return state.baseUrl
}

/**
 * Resolve an asset path returned by the CMS into an absolute URL.
 * @param {string} url
 * @returns {string}
 */
function resolveAsset(url) {
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  ensureResolved()
  if (!state.baseUrl) return url
  return `${state.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Build a URL with Payload-style bracketed query keys.
 * @param {string} path
 * @param {Record<string, unknown>} [query]
 * @returns {string}
 */
function buildUrl(path, query) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const params = new URLSearchParams()

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item === undefined || item === null || item === '') return
          params.append(`${key}[${index}]`, String(item))
        })
      } else {
        params.append(key, String(value))
      }
    }
  }

  const qs = params.toString()
  return `${state.baseUrl}${cleanPath}${qs ? `?${qs}` : ''}`
}

/**
 * Low-level GET. Never rejects.
 * @param {string} path
 * @param {{ query?: Record<string, unknown>, timeout?: number, credentials?: RequestCredentials, signal?: AbortSignal }} [options]
 * @returns {Promise<{ ok: boolean, data?: any, error?: string, status?: number }>}
 */
async function requestJSON(path, options = {}) {
  ensureResolved()

  if (typeof fetch !== 'function') {
    warn('fetch is unavailable in this environment.')
    return { ok: false, error: 'no-fetch' }
  }

  if (!state.baseUrl) {
    warn('CMS base URL is not configured — content reads return empty values.')
    return { ok: false, error: 'not-configured' }
  }

  const url = buildUrl(path, options.query)
  const timeout = typeof options.timeout === 'number' ? options.timeout : state.timeout

  /** @type {AbortController|undefined} */
  let controller
  try {
    if (typeof AbortController !== 'undefined') controller = new AbortController()
  } catch (_) {
    controller = undefined
  }

  let timer = null
  let onExternalAbort = null

  if (controller && timeout > 0) {
    timer = setTimeout(() => {
      try {
        controller.abort()
      } catch (_) {
        /* ignore */
      }
    }, timeout)
  }

  if (controller && options.signal) {
    if (options.signal.aborted) {
      try {
        controller.abort()
      } catch (_) {
        /* ignore */
      }
    } else {
      onExternalAbort = () => {
        try {
          controller.abort()
        } catch (_) {
          /* ignore */
        }
      }
      options.signal.addEventListener('abort', onExternalAbort)
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: options.credentials || 'omit',
      signal: controller ? controller.signal : undefined,
    })

    if (!response || !response.ok) {
      const status = response ? response.status : 0
      warn(`request failed with status ${status}.`)
      return { ok: false, error: `http-${status}`, status }
    }

    try {
      const data = await response.json()
      return { ok: true, data }
    } catch (_) {
      warn('received a malformed JSON response.')
      return { ok: false, error: 'invalid-json' }
    }
  } catch (error) {
    const aborted = Boolean(error && error.name === 'AbortError')
    warn(aborted ? 'request aborted or timed out.' : 'network request failed.')
    return { ok: false, error: aborted ? 'aborted' : 'network' }
  } finally {
    if (timer) clearTimeout(timer)
    if (onExternalAbort && options.signal) {
      try {
        options.signal.removeEventListener('abort', onExternalAbort)
      } catch (_) {
        /* ignore */
      }
    }
  }
}

/**
 * @template T
 * @returns {Page<T>}
 */
function emptyPage() {
  return {
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }
}

/**
 * Fetch a paginated collection list, never rejecting.
 * @param {string} collection
 * @param {{ limit?: number, page?: number, sort?: string, depth?: number, where?: Record<string, unknown>, signal?: AbortSignal }} [options]
 * @returns {Promise<Page<any>>}
 */
async function fetchList(collection, options = {}) {
  const query = {
    depth: options.depth === undefined ? 1 : options.depth,
    limit: options.limit === undefined ? DEFAULT_LIMIT : options.limit,
    sort: options.sort,
    page: options.page,
    ...(options.where || {}),
  }

  const result = await requestJSON(`/api/${collection}`, { query, signal: options.signal })
  if (!result.ok) return emptyPage()

  const data = result.data && typeof result.data === 'object' ? result.data : {}
  const docs = Array.isArray(data.docs) ? data.docs : []

  return {
    docs,
    totalDocs: typeof data.totalDocs === 'number' ? data.totalDocs : docs.length,
    totalPages: typeof data.totalPages === 'number' ? data.totalPages : docs.length > 0 ? 1 : 0,
    page: typeof data.page === 'number' ? data.page : 1,
    hasNextPage: Boolean(data.hasNextPage),
    hasPrevPage: Boolean(data.hasPrevPage),
  }
}

/**
 * @param {string} field
 * @param {string} operator
 * @param {string|number|boolean} value
 * @param {number} index
 * @returns {Record<string, unknown>}
 */
function andClause(field, operator, value, index) {
  return { [`where[and][${index}][${field}][${operator}]`]: value }
}

/**
 * Published disciplines, ordered by their manual `order`.
 * @param {{ limit?: number, sort?: string, depth?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Discipline[]>}
 */
export async function getDisciplines(options = {}) {
  const page = await fetchList('disciplines', {
    limit: options.limit,
    sort: options.sort || 'order',
    depth: options.depth,
    signal: options.signal,
    where: andClause('status', 'equals', 'published', 0),
  })
  return page.docs
}

/**
 * One discipline by slug (or null).
 * @param {string} slug
 * @param {{ depth?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Discipline|null>}
 */
export async function getDisciplineBySlug(slug, options = {}) {
  if (!slug) return null
  const page = await fetchList('disciplines', {
    limit: 1,
    depth: options.depth,
    signal: options.signal,
    where: {
      ...andClause('status', 'equals', 'published', 0),
      ...andClause('slug', 'equals', slug, 1),
    },
  })
  return page.docs[0] || null
}

/**
 * Published masterclasses with optional filtering and pagination.
 * @param {{ discipline?: string|number, featured?: boolean, search?: string, page?: number, limit?: number, sort?: string, depth?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Page<Video>>}
 */
export async function getVideos(options = {}) {
  const where = {}
  let index = 0

  Object.assign(where, andClause('status', 'equals', 'published', index++))

  if (options.discipline !== undefined && options.discipline !== null && options.discipline !== '') {
    Object.assign(where, andClause('discipline', 'equals', options.discipline, index++))
  }

  if (options.featured === true) {
    Object.assign(where, andClause('featured', 'equals', 'true', index++))
  }

  if (options.search) {
    where[`where[and][${index}][or][0][title][like]`] = options.search
    where[`where[and][${index}][or][1][summary][like]`] = options.search
    index++
  }

  return fetchList('videos', {
    limit: options.limit === undefined ? 24 : options.limit,
    page: options.page,
    sort: options.sort || '-publishedAt',
    depth: options.depth,
    signal: options.signal,
    where,
  })
}

/**
 * One masterclass by slug (or null).
 * @param {string} slug
 * @param {{ depth?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Video|null>}
 */
export async function getVideoBySlug(slug, options = {}) {
  if (!slug) return null
  const page = await fetchList('videos', {
    limit: 1,
    depth: options.depth === undefined ? 2 : options.depth,
    signal: options.signal,
    where: {
      ...andClause('status', 'equals', 'published', 0),
      ...andClause('slug', 'equals', slug, 1),
    },
  })
  return page.docs[0] || null
}

/**
 * Featured masterclasses for the home spotlight / Top 10 row.
 * @param {number} [limit]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Video[]>}
 */
export async function getFeaturedVideos(limit = 10, options = {}) {
  const page = await getVideos({ featured: true, limit, depth: 1, sort: '-publishedAt', signal: options.signal })
  return page.docs
}

/**
 * Global site settings (or null).
 * @param {{ depth?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<SiteSettings|null>}
 */
export async function getSiteSettings(options = {}) {
  const result = await requestJSON('/api/globals/site-settings', {
    query: { depth: options.depth === undefined ? 1 : options.depth },
    signal: options.signal,
  })
  if (!result.ok) return null
  return result.data && typeof result.data === 'object' ? result.data : null
}

/**
 * Resolve a media object (or id) into an absolute URL.
 * @param {Media|number|string|null|undefined} media
 * @param {string} [size] optional image size, e.g. 'card' | 'thumbnail' | 'wide' | 'og'
 * @returns {string}
 */
export function getMediaUrl(media, size) {
  if (!media) return ''
  if (typeof media === 'string') return resolveAsset(media)
  if (typeof media !== 'object') return ''

  const sized = size && media.sizes && media.sizes[size] ? media.sizes[size].url : ''
  const candidate = sized || media.url || ''
  return candidate ? resolveAsset(candidate) : ''
}

/**
 * Group a flat list of videos into per-discipline rows, ordered by the
 * discipline's `order`. Requires videos fetched with `depth >= 1` so the
 * `discipline` relationship is populated.
 * @param {Video[]} videos
 * @returns {{ key: string, discipline: Discipline|number|string|null, title: string, slug: string, order: number, videos: Video[] }[]}
 */
export function groupVideosByDiscipline(videos) {
  const list = Array.isArray(videos) ? videos : []
  const groups = new Map()

  for (const video of list) {
    if (!video || typeof video !== 'object') continue

    const discipline = video.discipline
    let key = 'unknown'
    let title = ''
    let slug = ''
    let order = 0

    if (discipline && typeof discipline === 'object') {
      key = String(discipline.id ?? discipline.slug ?? 'unknown')
      title = discipline.title || ''
      slug = discipline.slug || ''
      order = typeof discipline.order === 'number' ? discipline.order : 0
    } else if (discipline !== undefined && discipline !== null) {
      key = String(discipline)
    }

    if (!groups.has(key)) {
      groups.set(key, { key, discipline: discipline ?? null, title, slug, order, videos: [] })
    }
    groups.get(key).videos.push(video)
  }

  return Array.from(groups.values()).sort((a, b) => a.order - b.order)
}

export default {
  configure,
  isConfigured,
  getBaseUrl,
  getDisciplines,
  getDisciplineBySlug,
  getVideos,
  getVideoBySlug,
  getFeaturedVideos,
  getSiteSettings,
  getMediaUrl,
  groupVideosByDiscipline,
}
