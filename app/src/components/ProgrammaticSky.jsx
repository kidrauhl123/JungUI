import { useEffect, useRef, useState } from 'react'
import { ANDO_SORA_DEFAULTS, createAndoSoraSkyRenderer } from '../lib/andoSoraSky.js'

const DEFAULTS = ANDO_SORA_DEFAULTS
const DEFAULT_WIND = [1, 0]
const WIND_DIRECTIONS = [
  { label: '向右', angle: 0, vector: [1, 0] },
  { label: '右下', angle: 45, vector: [0.707, 0.707] },
  { label: '向下', angle: 90, vector: [0, 1] },
  { label: '左下', angle: 135, vector: [-0.707, 0.707] },
  { label: '向左', angle: 180, vector: [-1, 0] },
  { label: '左上', angle: 225, vector: [-0.707, -0.707] },
  { label: '向上', angle: 270, vector: [0, -1] },
  { label: '右上', angle: 315, vector: [0.707, -0.707] },
]

export function ProgrammaticSky({
  className = '',
  variant = 'default',
  warmth = DEFAULTS.warmth,
  clouds = DEFAULTS.clouds,
  softness = DEFAULTS.softness,
  drift = DEFAULTS.drift,
  grain = DEFAULTS.grain,
  wind = DEFAULT_WIND,
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const [initialSettings] = useState(() => ({ warmth, clouds, softness, drift, grain, wind }))
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    rendererRef.current?.update({ warmth, clouds, softness, drift, grain, wind })
  }, [clouds, drift, grain, softness, warmth, wind])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    setReady(false)
    setFailed(false)
    const renderer = createAndoSoraSkyRenderer(canvas, initialSettings, () => setReady(true))

    if (!renderer) {
      setFailed(true)
      return undefined
    }

    rendererRef.current = renderer

    return () => {
      renderer.dispose()
      if (rendererRef.current === renderer) rendererRef.current = null
    }
  }, [initialSettings])

  return (
    <div className={`programmatic-sky programmatic-sky--sora programmatic-sky--${variant} ${ready ? 'is-ready' : ''} ${failed ? 'is-failed' : ''} ${className}`}>
      <canvas ref={canvasRef} className="programmatic-sky__canvas" aria-hidden="true" />
      <div className="programmatic-sky__fallback" aria-hidden="true" />
      <div className="programmatic-sky__haze" aria-hidden="true" />
      <div className="programmatic-sky__grain" aria-hidden="true" />
    </div>
  )
}

export function ProgrammaticSkyPreview() {
  return (
    <div className="item programmatic-sky-item">
      <a className="sky-preview-card" href="/patterns/programmatic-sky/" target="_top" aria-label="打开程序化天空背景预览">
        <ProgrammaticSky
          className="sky-preview-card__sky"
          variant="preview"
          clouds={DEFAULTS.clouds}
          drift={DEFAULTS.drift}
        />
        <div className="sky-preview-card__chrome" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="sky-preview-card__panel">
          <span className="sky-preview-card__title">Atmosphere</span>
          <span className="sky-preview-card__line sky-preview-card__line--long" />
          <span className="sky-preview-card__line" />
        </div>
      </a>
      <div className="caption">
        <div className="name">程序化天空</div>
        <div className="note">Ando Sora WebGL 天空 · bloom · tone map · 无视频素材</div>
      </div>
    </div>
  )
}

export function ProgrammaticSkyPage() {
  const [skySettings, setSkySettings] = useState({
    warmth: DEFAULTS.warmth,
    clouds: DEFAULTS.clouds,
    drift: DEFAULTS.drift,
  })
  const [windIndex, setWindIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const windDirection = WIND_DIRECTIONS[windIndex]
  const updateSkySetting = (key) => (event) => {
    setSkySettings((current) => ({ ...current, [key]: Number(event.target.value) }))
  }
  const cycleWindDirection = () => {
    setWindIndex((current) => (current + 1) % WIND_DIRECTIONS.length)
  }
  const copySkyParams = async () => {
    const params = {
      warmth: Number(skySettings.warmth.toFixed(2)),
      clouds: Number(skySettings.clouds.toFixed(2)),
      drift: Number(skySettings.drift.toFixed(2)),
      softness: DEFAULTS.softness,
      grain: DEFAULTS.grain,
      wind: {
        label: windDirection.label,
        angle: windDirection.angle,
        vector: windDirection.vector,
      },
    }
    const text = JSON.stringify(params, null, 2)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <main className="sky-page">
      <nav className="pattern-topbar sky-page__topbar" aria-label="页面导航">
        <a href="/">JungUI</a>
        <span>Programmatic Sky</span>
      </nav>
      <section className="sky-page__stage" aria-label="Programmatic sky background study">
        <ProgrammaticSky
          className="sky-page__atmosphere"
          variant="full"
          warmth={skySettings.warmth}
          clouds={skySettings.clouds}
          softness={DEFAULTS.softness}
          drift={skySettings.drift}
          grain={DEFAULTS.grain}
          wind={windDirection.vector}
        />
        <div className="sky-page__glass">
          <p>JungUI</p>
          <h1>Programmatic sky</h1>
          <span>Ando Sora WebGL atmosphere study</span>
        </div>
        <div className="sky-page__controls" aria-label="天空参数">
          <label className="sky-page__control sky-page__control--tone">
            <span>Sky</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={skySettings.warmth}
              onChange={updateSkySetting('warmth')}
              aria-label="Sky color tone"
            />
          </label>
          <label className="sky-page__control">
            <span>Cloud</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={skySettings.clouds}
              onChange={updateSkySetting('clouds')}
              aria-label="Cloud density"
            />
          </label>
          <label className="sky-page__control">
            <span>Flow</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={skySettings.drift}
              onChange={updateSkySetting('drift')}
              aria-label="Cloud flow speed"
            />
          </label>
          <button
            className="sky-page__direction"
            type="button"
            style={{ '--wind-angle': `${windDirection.angle}deg` }}
            onClick={cycleWindDirection}
            aria-label={`切换风向：${windDirection.label}`}
            title={`风向：${windDirection.label}`}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h10.2M10.8 5.8 15 10l-4.2 4.2" />
            </svg>
          </button>
          <button
            className="sky-page__export"
            type="button"
            onClick={copySkyParams}
            aria-live="polite"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>
    </main>
  )
}
