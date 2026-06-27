import { useEffect, useRef } from 'react'

// reusable organic rippling line field (summed sines) — the confirmed JungUI background animation
export default function RippleField({ stroke = '#2f7bd4', lines = 12, width = 264, height = 300, className }) {
  const ref = useRef(null)
  useEffect(() => {
    const svg = ref.current
    const NS = 'http://www.w3.org/2000/svg'
    const paths = []
    for (let i = 0; i < lines; i++) {
      const p = document.createElementNS(NS, 'path')
      p.setAttribute('opacity', (0.85 - i * 0.02).toFixed(2))
      p.setAttribute('stroke', stroke)
      svg.appendChild(p)
      paths.push(p)
    }
    const gap = height / (lines - 1)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const wave = (x, l, t) => {
      const ph = l * 0.55
      return (
        7.0 * Math.sin(0.024 * x + t * 0.75 + ph) +
        4.5 * Math.sin(0.013 * x - t * 0.5 + ph * 1.7) +
        2.6 * Math.sin(0.045 * x + t * 1.2 + ph * 0.4) +
        1.8 * Math.sin(0.08 * x - t * 0.95)
      )
    }
    let raf, start = null
    const loop = (ts) => {
      if (start === null) start = ts
      const t = (ts - start) / 1000
      for (let i = 0; i < lines; i++) {
        const by = i * gap
        let d = `M -10 ${(by + wave(-10, i, t)).toFixed(2)}`
        for (let x = 0; x <= width + 10; x += 8) d += ` L ${x} ${(by + wave(x, i, t)).toFixed(2)}`
        paths[i].setAttribute('d', d)
      }
      if (!reduce) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); paths.forEach((p) => p.remove()) }
  }, [stroke, lines, width, height])

  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" fill="none" strokeWidth="1.8" strokeLinecap="round" />
  )
}
