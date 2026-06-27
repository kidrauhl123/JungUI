import { useEffect, useRef } from 'react'

// each card's internal animation — runs continuously, lives entirely inside its card
export function Bars({ n = 26 }) {
  const ref = useRef(null)
  useEffect(() => {
    const bars = [...ref.current.children]
    let raf; const t0 = performance.now()
    const loop = (t) => {
      const e = (t - t0) / 1000
      bars.forEach((b, i) => {
        const h = 0.32 + 0.6 * (0.5 + 0.5 * Math.sin(e * 1.6 + i * 0.5)) * (0.55 + 0.45 * Math.sin(i * 1.3))
        b.style.transform = `scaleY(${h})`
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="bars" ref={ref}>{Array.from({ length: n }).map((_, i) => <i key={i} />)}</div>
}

export function Dots({ n = 40 }) {
  const ref = useRef(null)
  useEffect(() => {
    const dots = [...ref.current.children]
    let raf; const t0 = performance.now()
    const loop = (t) => {
      const e = (t - t0) / 1000
      dots.forEach((d, i) => {
        const r = i % 10, c = (i / 10) | 0
        d.style.opacity = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(e * 2 + r * 0.5 + c * 0.6))
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="dots" ref={ref}>{Array.from({ length: n }).map((_, i) => <i key={i} />)}</div>
}

export function Orbit() {
  return (
    <div className="orbit">
      <i style={{ width: 54, height: 54, animation: 'deckspin 6s linear infinite' }} />
      <i style={{ width: 104, height: 104, animation: 'deckspin 11s linear infinite reverse' }} />
      <i style={{ width: 20, height: 20, background: 'currentColor', border: 'none', opacity: 0.9 }} />
    </div>
  )
}

export function TypeLine() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const text = '> assembling principles_'
    const chars = '!<>-_/[]{}=+*?#01'
    let raf = null, to = null, frame = 0
    const q = [...text].map((ch) => { const s = (Math.random() * 12) | 0; return { to: ch, s, e: s + 8 + ((Math.random() * 14) | 0), c: '' } })
    const loop = () => {
      let out = '', ok = 0
      for (const o of q) {
        if (frame >= o.e) { ok++; out += o.to }
        else if (frame >= o.s) { if (!o.c || Math.random() < 0.3) o.c = chars[(Math.random() * chars.length) | 0]; out += o.c }
        else out += ' '
      }
      el.textContent = out; frame++
      if (ok < q.length) raf = requestAnimationFrame(loop)
      else to = setTimeout(() => { frame = 0; q.forEach((o) => (o.c = '')); loop() }, 1500)
    }
    loop()
    return () => { if (raf) cancelAnimationFrame(raf); if (to) clearTimeout(to) }
  }, [])
  return <div className="typeline" ref={ref} />
}
