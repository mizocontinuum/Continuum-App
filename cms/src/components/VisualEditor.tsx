'use client'

import React, { useEffect, useRef, useState } from 'react'

type MediaRelation = {
  id?: number | string
  url?: string
  alt?: string
} | number | string | null

type HeroLayout = {
  textAlignment: 'center' | 'left'
  heightDesktop: number
  heightMobile: number
  titleSizeDesktop: number
  titleSizeMobile: number
  contentMaxWidth: number
  backgroundPositionX: number
  backgroundPositionY: number
  overlayOpacity: number
  showEyebrow: boolean
  showPrimaryCta: boolean
  showSecondaryCta: boolean
  showGrid: boolean
  showAnimatedEmblem: boolean
}

type EditorSettings = {
  siteName: string
  accentColor: string
  logo: MediaRelation
  heroEyebrow: string
  heroTitleLead: string
  heroTitleAccent: string
  heroTitleTail: string
  heroSubtitle: string
  heroImage: MediaRelation
  heroCtaLabel: string
  heroCtaHref: string
  heroSecondaryCtaLabel: string
  heroSecondaryCtaHref: string
  signInLabel: string
  heroLayout: HeroLayout
}

const DEFAULT_SETTINGS: EditorSettings = {
  siteName: 'Continuum Academy',
  accentColor: '#4cc3e0',
  logo: null,
  heroEyebrow: 'The Performance Learning Academy',
  heroTitleLead: 'Learn how the best',
  heroTitleAccent: 'lead, build and grow',
  heroTitleTail: '.',
  heroSubtitle:
    'Stream masterclasses from founders and operators who have done it before. One discipline at a time, built for the decisions you face this quarter.',
  heroImage: null,
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

const mergeSettings = (data: Partial<EditorSettings>): EditorSettings => {
  const result = { ...DEFAULT_SETTINGS, ...data }
  const layout = { ...DEFAULT_SETTINGS.heroLayout, ...(data.heroLayout || {}) }
  const numeric = (value: number, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback
  const normalizedLayout: HeroLayout = {
    ...layout,
    textAlignment: layout.textAlignment === 'left' ? 'left' : 'center',
    heightDesktop: numeric(layout.heightDesktop, DEFAULT_SETTINGS.heroLayout.heightDesktop),
    heightMobile: numeric(layout.heightMobile, DEFAULT_SETTINGS.heroLayout.heightMobile),
    titleSizeDesktop: numeric(layout.titleSizeDesktop, DEFAULT_SETTINGS.heroLayout.titleSizeDesktop),
    titleSizeMobile: numeric(layout.titleSizeMobile, DEFAULT_SETTINGS.heroLayout.titleSizeMobile),
    contentMaxWidth: numeric(layout.contentMaxWidth, DEFAULT_SETTINGS.heroLayout.contentMaxWidth),
    backgroundPositionX: numeric(layout.backgroundPositionX, DEFAULT_SETTINGS.heroLayout.backgroundPositionX),
    backgroundPositionY: numeric(layout.backgroundPositionY, DEFAULT_SETTINGS.heroLayout.backgroundPositionY),
    overlayOpacity: numeric(layout.overlayOpacity, DEFAULT_SETTINGS.heroLayout.overlayOpacity),
    showEyebrow: typeof layout.showEyebrow === 'boolean' ? layout.showEyebrow : true,
    showPrimaryCta: typeof layout.showPrimaryCta === 'boolean' ? layout.showPrimaryCta : true,
    showSecondaryCta: typeof layout.showSecondaryCta === 'boolean' ? layout.showSecondaryCta : true,
    showGrid: typeof layout.showGrid === 'boolean' ? layout.showGrid : true,
    showAnimatedEmblem: typeof layout.showAnimatedEmblem === 'boolean' ? layout.showAnimatedEmblem : true,
  }

  return {
    ...result,
    siteName: data.siteName ?? DEFAULT_SETTINGS.siteName,
    accentColor: data.accentColor ?? DEFAULT_SETTINGS.accentColor,
    heroEyebrow: data.heroEyebrow ?? DEFAULT_SETTINGS.heroEyebrow,
    heroTitleLead: data.heroTitleLead ?? DEFAULT_SETTINGS.heroTitleLead,
    heroTitleAccent: data.heroTitleAccent ?? DEFAULT_SETTINGS.heroTitleAccent,
    heroTitleTail: data.heroTitleTail ?? DEFAULT_SETTINGS.heroTitleTail,
    heroSubtitle: data.heroSubtitle ?? DEFAULT_SETTINGS.heroSubtitle,
    heroCtaLabel: data.heroCtaLabel ?? DEFAULT_SETTINGS.heroCtaLabel,
    heroCtaHref: data.heroCtaHref ?? DEFAULT_SETTINGS.heroCtaHref,
    heroSecondaryCtaLabel: data.heroSecondaryCtaLabel ?? DEFAULT_SETTINGS.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: data.heroSecondaryCtaHref ?? DEFAULT_SETTINGS.heroSecondaryCtaHref,
    signInLabel: data.signInLabel ?? DEFAULT_SETTINGS.signInLabel,
    heroLayout: normalizedLayout,
  }
}

const mediaID = (media: MediaRelation): number | string | null => {
  if (media && typeof media === 'object') return media.id ?? null
  return typeof media === 'number' || typeof media === 'string' ? media : null
}

const mediaURL = (media: MediaRelation): string => {
  return media && typeof media === 'object' ? media.url || '' : ''
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json()
    return body.errors?.[0]?.message || body.message || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

export default function VisualEditor() {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS)
  const [access, setAccess] = useState<'checking' | 'admin' | 'denied' | 'error'>('checking')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [localImageURL, setLocalImageURL] = useState('')
  const [localLogoURL, setLocalLogoURL] = useState('')
  const [imageError, setImageError] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const userResponse = await fetch('/api/users/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        })
        const userResult = await userResponse.json()
        const user = userResult.user

        if (!user || user.role !== 'admin') {
          if (!cancelled) setAccess('denied')
          return
        }

        const settingsResponse = await fetch('/api/globals/site-settings?depth=1', {
          credentials: 'same-origin',
          cache: 'no-store',
        })
        if (!settingsResponse.ok) throw new Error(await getErrorMessage(settingsResponse))

        const result = await settingsResponse.json()
        if (!cancelled) {
          setSettings(mergeSettings(result))
          setAccess('admin')
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Hindi ma-load ang page settings.')
          setAccess('error')
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (localImageURL) URL.revokeObjectURL(localImageURL)
      if (localLogoURL) URL.revokeObjectURL(localLogoURL)
    }
  }, [localImageURL, localLogoURL])

  useEffect(() => {
    const frame = iframeRef.current?.contentWindow
    if (!frame) return
    frame.postMessage(
      { type: 'continuum:site-preview', settings },
      window.location.origin,
    )
  }, [settings, previewSize])

  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setMessage('May hindi pa nase-save na pagbabago.')
  }

  const updateLayout = <K extends keyof HeroLayout>(key: K, value: HeroLayout[K]) => {
    setSettings((current) => ({
      ...current,
      heroLayout: { ...current.heroLayout, [key]: value },
    }))
    setMessage('May hindi pa nase-save na pagbabago.')
  }

  const chooseImage = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Pumili ng image file.')
      return
    }
    if (localImageURL) URL.revokeObjectURL(localImageURL)
    const url = URL.createObjectURL(file)
    setLocalImageURL(url)
    setSelectedFile(file)
    setImageError('')
    update('heroImage', { url, alt: file.name })
  }

  const chooseLogo = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Pumili ng image file para sa logo.')
      return
    }
    if (localLogoURL) URL.revokeObjectURL(localLogoURL)
    const url = URL.createObjectURL(file)
    setLocalLogoURL(url)
    setSelectedLogoFile(file)
    setImageError('')
    update('logo', { url, alt: file.name })
  }

  const removeImage = () => {
    if (localImageURL) URL.revokeObjectURL(localImageURL)
    setLocalImageURL('')
    setSelectedFile(null)
    setSettings((current) => ({ ...current, heroImage: null }))
    setMessage('May hindi pa nase-save na pagbabago.')
  }

  const removeLogo = () => {
    if (localLogoURL) URL.revokeObjectURL(localLogoURL)
    setLocalLogoURL('')
    setSelectedLogoFile(null)
    setSettings((current) => ({ ...current, logo: null }))
    setMessage('May hindi pa nase-save na pagbabago.')
  }

  const save = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      let imageID = mediaID(settings.heroImage)
      let logoID = mediaID(settings.logo)
      if (selectedFile) {
        imageID = await uploadMedia(selectedFile, 'Landing page hero background')
      }
      if (selectedLogoFile) {
        logoID = await uploadMedia(selectedLogoFile, settings.siteName || 'Continuum Academy logo')
      }

      const response = await fetch('/api/globals/site-settings?depth=1', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          heroImage: imageID,
          logo: logoID,
        }),
      })
      if (!response.ok) throw new Error(await getErrorMessage(response))

      const result = await response.json()
      setSettings(mergeSettings(result))
      setSelectedFile(null)
      setSelectedLogoFile(null)
      setLocalImageURL('')
      setLocalLogoURL('')
      setMessage('Na-save at nailathala ang mga pagbabago sa live website.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Hindi na-save ang settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const uploadMedia = async (file: File, alt: string): Promise<number | string> => {
    const form = new FormData()
    form.append('file', file)
    form.append('alt', alt)
    const response = await fetch('/api/media?depth=0', {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    })
    if (!response.ok) throw new Error(await getErrorMessage(response))
    const result = await response.json()
    const id = result.doc?.id ?? result.id
    if (!id) throw new Error('Na-upload ang image pero walang media ID na naibalik.')
    return id
  }

  if (access === 'checking') {
    return <div className="continuum-editor-state">Binubuksan ang visual editor...</div>
  }

  if (access === 'denied') {
    return (
      <div className="continuum-editor-state">
        <h1>Admin access lang</h1>
        <p>Mag-sign in gamit ang admin account para ma-edit ang website.</p>
        <a href="/admin/login">Pumunta sa admin sign in</a>
      </div>
    )
  }

  if (access === 'error') {
    return (
      <div className="continuum-editor-state">
        <h1>Hindi mabuksan ang editor</h1>
        <p>{message}</p>
        <button type="button" onClick={() => window.location.reload()}>Subukan muli</button>
      </div>
    )
  }

  return (
    <main className="continuum-editor">
      <header className="continuum-editor__header">
        <div>
          <p className="continuum-editor__eyebrow">CONTINUUM WEBSITE</p>
          <h1>Visual Editor</h1>
          <p>I-edit ang landing page at tingnan agad ang preview bago i-save.</p>
        </div>
        <div className="continuum-editor__actions">
          <a href="/" target="_blank" rel="noreferrer">Buksan ang live site</a>
          <button type="button" onClick={save} disabled={isSaving}>
            {isSaving ? 'Sine-save...' : 'Save at Publish'}
          </button>
        </div>
      </header>

      <div className="continuum-editor__workspace">
        <aside className="continuum-editor__panel" aria-label="Landing page controls">
          <section className="continuum-editor__section">
            <h2>Branding</h2>
            <TextField label="Site name" value={settings.siteName} onChange={(value) => update('siteName', value)} />
            <label className="continuum-editor__field">
              <span>Accent color</span>
              <input type="color" value={settings.accentColor || '#4cc3e0'} onChange={(event) => update('accentColor', event.target.value)} />
            </label>
            <label className="continuum-editor__field">
              <span>Palitan ang header logo</span>
              <input type="file" accept="image/*" onChange={(event) => chooseLogo(event.target.files?.[0])} />
            </label>
            {(localLogoURL || mediaURL(settings.logo)) && (
              <div className="continuum-editor__image-preview">
                <img src={localLogoURL || mediaURL(settings.logo)} alt="Current site logo" />
                <button type="button" onClick={removeLogo}>Alisin ang logo</button>
              </div>
            )}
            <TextField label="Sign-in button text" value={settings.signInLabel} onChange={(value) => update('signInLabel', value)} />
          </section>

          <section className="continuum-editor__section">
            <h2>Mga layer</h2>
            <p className="continuum-editor__hint">Ipakita o itago ang mga bahagi ng hero section.</p>
            <Toggle label="Eyebrow label" checked={settings.heroLayout.showEyebrow} onChange={(value) => updateLayout('showEyebrow', value)} />
            <Toggle label="Primary button" checked={settings.heroLayout.showPrimaryCta} onChange={(value) => updateLayout('showPrimaryCta', value)} />
            <Toggle label="Secondary button" checked={settings.heroLayout.showSecondaryCta} onChange={(value) => updateLayout('showSecondaryCta', value)} />
            <Toggle label="Background grid" checked={settings.heroLayout.showGrid} onChange={(value) => updateLayout('showGrid', value)} />
            <Toggle label="Animated logo layer" checked={settings.heroLayout.showAnimatedEmblem} onChange={(value) => updateLayout('showAnimatedEmblem', value)} />
          </section>

          <section className="continuum-editor__section">
            <h2>Hero content</h2>
            <TextField label="Eyebrow text" value={settings.heroEyebrow} onChange={(value) => update('heroEyebrow', value)} />
            <TextField label="Headline" value={settings.heroTitleLead} onChange={(value) => update('heroTitleLead', value)} />
            <TextField label="Highlighted headline" value={settings.heroTitleAccent} onChange={(value) => update('heroTitleAccent', value)} />
            <TextField label="Headline ending" value={settings.heroTitleTail} onChange={(value) => update('heroTitleTail', value)} />
            <label className="continuum-editor__field">
              <span>Subtitle</span>
              <textarea rows={4} value={settings.heroSubtitle} onChange={(event) => update('heroSubtitle', event.target.value)} />
            </label>
          </section>

          <section className="continuum-editor__section">
            <h2>Mga button</h2>
            <TextField label="Primary button text" value={settings.heroCtaLabel} onChange={(value) => update('heroCtaLabel', value)} />
            <TextField label="Primary button link" value={settings.heroCtaHref} onChange={(value) => update('heroCtaHref', value)} />
            <TextField label="Secondary button text" value={settings.heroSecondaryCtaLabel} onChange={(value) => update('heroSecondaryCtaLabel', value)} />
            <TextField label="Secondary button link" value={settings.heroSecondaryCtaHref} onChange={(value) => update('heroSecondaryCtaHref', value)} />
          </section>

          <section className="continuum-editor__section">
            <h2>Background image</h2>
            <label className="continuum-editor__field">
              <span>Palitan ang hero image</span>
              <input type="file" accept="image/*" onChange={(event) => chooseImage(event.target.files?.[0])} />
            </label>
            {imageError && <p className="continuum-editor__error">{imageError}</p>}
            {(localImageURL || mediaURL(settings.heroImage)) && (
              <div className="continuum-editor__image-preview">
                <img src={localImageURL || mediaURL(settings.heroImage)} alt="Current hero background" />
                <button type="button" onClick={removeImage}>Alisin ang image</button>
              </div>
            )}
            <RangeField label="Image horizontal position" min={0} max={100} value={settings.heroLayout.backgroundPositionX} suffix="%" onChange={(value) => updateLayout('backgroundPositionX', value)} />
            <RangeField label="Image vertical position" min={0} max={100} value={settings.heroLayout.backgroundPositionY} suffix="%" onChange={(value) => updateLayout('backgroundPositionY', value)} />
            <RangeField label="Dark overlay" min={0} max={90} value={settings.heroLayout.overlayOpacity} suffix="%" onChange={(value) => updateLayout('overlayOpacity', value)} />
          </section>

          <section className="continuum-editor__section">
            <h2>Sukat at alignment</h2>
            <label className="continuum-editor__field">
              <span>Alignment</span>
              <select value={settings.heroLayout.textAlignment} onChange={(event) => updateLayout('textAlignment', event.target.value as HeroLayout['textAlignment'])}>
                <option value="center">Center</option>
                <option value="left">Left</option>
              </select>
            </label>
            <RangeField label="Hero height desktop" min={60} max={110} value={settings.heroLayout.heightDesktop} suffix="vh" onChange={(value) => updateLayout('heightDesktop', value)} />
            <RangeField label="Hero height mobile" min={55} max={100} value={settings.heroLayout.heightMobile} suffix="vh" onChange={(value) => updateLayout('heightMobile', value)} />
            <RangeField label="Headline size desktop" min={32} max={96} value={settings.heroLayout.titleSizeDesktop} suffix="px" onChange={(value) => updateLayout('titleSizeDesktop', value)} />
            <RangeField label="Headline size mobile" min={24} max={60} value={settings.heroLayout.titleSizeMobile} suffix="px" onChange={(value) => updateLayout('titleSizeMobile', value)} />
            <RangeField label="Content width" min={600} max={1600} value={settings.heroLayout.contentMaxWidth} suffix="px" onChange={(value) => updateLayout('contentMaxWidth', value)} />
          </section>

          <p className="continuum-editor__notice">
            Ang “Save at Publish” ay agad mag-a-update sa live site. I-preview muna sa desktop at mobile.
          </p>
        </aside>

        <section className="continuum-editor__preview" aria-label="Live page preview">
          <div className="continuum-editor__preview-toolbar">
            <div>
              <strong>Live preview</strong>
              <span>Hindi pa nailalathalang changes ay preview mo lang.</span>
            </div>
            <div className="continuum-editor__preview-switch" role="group" aria-label="Preview size">
              <button type="button" className={previewSize === 'desktop' ? 'is-active' : ''} onClick={() => setPreviewSize('desktop')}>Desktop</button>
              <button type="button" className={previewSize === 'mobile' ? 'is-active' : ''} onClick={() => setPreviewSize('mobile')}>Mobile</button>
            </div>
          </div>
          <div className={`continuum-editor__frame-wrap is-${previewSize}`}>
            <iframe
              ref={iframeRef}
              key={previewSize}
              title="Continuum landing page live preview"
              src="/?cmsPreview=1"
              onLoad={() => {
                iframeRef.current?.contentWindow?.postMessage(
                  { type: 'continuum:site-preview', settings },
                  window.location.origin,
                )
              }}
            />
          </div>
          <div className="continuum-editor__save-status" aria-live="polite">{message}</div>
        </section>
      </div>
    </main>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="continuum-editor__field">
      <span>{label}</span>
      <input type="text" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function RangeField({ label, min, max, value, suffix, onChange }: {
  label: string
  min: number
  max: number
  value: number
  suffix: string
  onChange: (value: number) => void
}) {
  return (
    <label className="continuum-editor__range">
      <span>{label}<strong>{value}{suffix}</strong></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="continuum-editor__toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
