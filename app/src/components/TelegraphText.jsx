import { useEffect, useRef, useState } from 'react'
import {
  makeTelegraphTransitionPlan,
  renderTelegraphTransitionFrame,
  telegraphDuration,
} from '../lib/telegraphText.js'

const COMPACT = 'MIA'
const EXPANDED = 'Multiple Intelligent Agents'

export default function TelegraphText() {
  const readoutRef = useRef(null)
  const currentTextRef = useRef(COMPACT)
  const seedRef = useRef(3)
  const [target, setTarget] = useState(COMPACT)

  useEffect(() => {
    const node = readoutRef.current
    if (!node) return undefined
    if (target === currentTextRef.current) {
      node.textContent = target
      return undefined
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = currentTextRef.current
    const plan = makeTelegraphTransitionPlan(from, target, { seed: seedRef.current++ })
    const duration = telegraphDuration(plan)
    let raf = null
    let startedAt = 0

    if (reduceMotion) {
      node.textContent = target
      currentTextRef.current = target
      return undefined
    }

    const tick = (now) => {
      if (!startedAt) startedAt = now
      const frame = Math.min(duration, Math.floor((now - startedAt) / 26))
      const output = renderTelegraphTransitionFrame(from, target, frame, plan)
      node.textContent = output
      currentTextRef.current = output

      if (frame < duration) {
        raf = requestAnimationFrame(tick)
      } else {
        node.textContent = target
        currentTextRef.current = target
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <div className="item telegraph-text-item">
      <button
        className="telegraph-word"
        type="button"
        aria-label={target}
        onMouseEnter={() => setTarget(EXPANDED)}
        onMouseLeave={() => setTarget(COMPACT)}
        onFocus={() => setTarget(EXPANDED)}
        onBlur={() => setTarget(COMPACT)}
      >
        <span className="telegraph-word-grid" aria-hidden="true" />
        <span className="telegraph-word-text" ref={readoutRef} aria-hidden="true">{COMPACT}</span>
      </button>
      <div className="caption">
        <div className="name">MIA 电报展开</div>
      </div>
    </div>
  )
}
