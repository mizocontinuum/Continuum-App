import { configure, getMediaUrl, getSiteSettings } from '../lib/cms.js'

const defaults = {
  siteName: 'Continuum Academy',
  heroEyebrow: 'The Performance Learning Academy',
  heroTitleLead: 'Learn how the best',
  heroTitleAccent: 'lead, build and grow',
  heroTitleTail: '.',
  heroSubtitle:
    'Stream masterclasses from founders and operators who have done it before. One discipline at a time, built for the decisions you face this quarter.',
  heroCtaLabel: 'Enter the Academy',
  heroCtaHref: '#disciplinesSection',
  heroSecondaryCtaLabel: 'Create a free account',
  heroSecondaryCtaHref: 'signup/',
  signInLabel: 'Sign in',
  heroLayout: {
    textAlignment: 'center',
    heightDesktop: 92,
    heightMobile: 70,
    titleSizeDesktop: 64,
    titleSizeMobile: 36,
    contentMaxWidth: 1200,
    backgroundPositionX: 75,
    backgroundPositionY: 50,
    overlayOpacity: 58,
    showEyebrow: true,
    showPrimaryCta: true,
    showSecondaryCta: true,
    showGrid: true,
    showAnimatedEmblem: true,
  },
}

const safeHref = (value, fallback) => {
  const href = String(value || '').trim()
  return /^(javascript|data|vbscript):/i.test(href) ? fallback : href || fallback
}

const setText = (selector, value) => {
  const element = document.querySelector(selector)
  if (element && typeof value === 'string') element.textContent = value
}

const setLayerVisibility = (selector, visible) => {
  const element = document.querySelector(selector)
  if (element) element.classList.toggle('cms-hidden', !visible)
}

const mergeSettings = (input = {}) => {
  const result = { ...defaults, ...input }
  const layout = { ...defaults.heroLayout, ...(input.heroLayout || {}) }
  for (const [key, value] of Object.entries(layout)) {
    if (value === null || value === undefined) layout[key] = defaults.heroLayout[key]
  }
  for (const key of Object.keys(defaults)) {
    if (key !== 'heroImage' && (input[key] === null || input[key] === undefined)) {
      result[key] = defaults[key]
    }
  }
  result.heroLayout = layout
  return result
}

const applySettings = (input) => {
  const settings = mergeSettings(input)
  const layout = settings.heroLayout
  const root = document.documentElement.style
  const title = document.querySelector('.landing-title')

  setText('.landing-eyebrow', settings.heroEyebrow)
  setText('.landing-lede', settings.heroSubtitle)
  setText('#enterAcademyBtn', settings.heroCtaLabel)
  setText('.landing-cta .landing-btn.secondary', settings.heroSecondaryCtaLabel)
  setText('.landing-nav a', settings.signInLabel)

  if (title) {
    const leadText = settings.heroTitleLead || ''
    const accentText = settings.heroTitleAccent || ''
    const lead = document.createTextNode(`${leadText}${leadText && accentText ? ' ' : ''}`)
    const accent = document.createElement('em')
    accent.textContent = accentText
    const tail = document.createTextNode(settings.heroTitleTail || '')
    title.replaceChildren(lead, accent, tail)
  }

  const primary = document.getElementById('enterAcademyBtn')
  const secondary = document.querySelector('.landing-cta .landing-btn.secondary')
  if (primary) primary.href = safeHref(settings.heroCtaHref, '#disciplinesSection')
  if (secondary) secondary.href = safeHref(settings.heroSecondaryCtaHref, 'signup/')

  if (settings.metaTitle) document.title = settings.metaTitle
  if (settings.metaDescription) {
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.content = settings.metaDescription
  }

  const logoUrl = getMediaUrl(settings.logo)
  if (logoUrl) {
    document.querySelectorAll('.landing-logo').forEach((image) => {
      image.src = logoUrl
      image.alt = settings.siteName || defaults.siteName || 'Continuum Academy'
    })
  }
  const faviconURL = getMediaUrl(settings.favicon)
  if (faviconURL) {
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
      link.href = faviconURL
    })
  }
  setText('.landing-footer span', settings.footerNote)

  if (settings.accentColor && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(settings.accentColor)) {
    root.setProperty('--azure', settings.accentColor)
    root.setProperty('--azure-bright', settings.accentColor)
    root.setProperty('--azure-vivid', settings.accentColor)
  }

  const heroUrl = getMediaUrl(settings.heroImage)
  const background = document.querySelector('.hero-bg-layer')
  if (background && heroUrl) {
    root.setProperty('--hero-image', `url(${JSON.stringify(heroUrl)})`)
  } else root.removeProperty('--hero-image')

  const alignment = layout.textAlignment === 'left' ? 'left' : 'center'
  root.setProperty('--hero-height-desktop', `${layout.heightDesktop}vh`)
  root.setProperty('--hero-height-mobile', `${layout.heightMobile}vh`)
  root.setProperty('--hero-title-size-desktop', `${layout.titleSizeDesktop}px`)
  root.setProperty('--hero-title-size-mobile', `${layout.titleSizeMobile}px`)
  root.setProperty('--hero-content-max-width', `${layout.contentMaxWidth}px`)
  root.setProperty('--hero-image-position', `${layout.backgroundPositionX}% ${layout.backgroundPositionY}%`)
  root.setProperty('--hero-overlay-opacity', String(layout.overlayOpacity / 100))
  root.setProperty('--hero-flex-alignment', alignment === 'left' ? 'flex-start' : 'center')
  root.setProperty('--hero-text-alignment', alignment)

  setLayerVisibility('.landing-eyebrow', layout.showEyebrow)
  setLayerVisibility('#enterAcademyBtn', layout.showPrimaryCta)
  setLayerVisibility('.landing-cta .landing-btn.secondary', layout.showSecondaryCta)
  setLayerVisibility('.hero-grid-floor', layout.showGrid)
  setLayerVisibility('.hero-spline-stage', layout.showAnimatedEmblem)
}

configure({ baseUrl: window.location.origin, timeout: 8000 })

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== 'continuum:site-preview') return
  if (!event.data.settings || typeof event.data.settings !== 'object') return
  applySettings(event.data.settings)
})

try {
  const settings = await getSiteSettings({ depth: 1 })
  if (settings) applySettings(settings)
} catch (error) {
  console.warn('[cms] landing settings not applied:', error)
}
