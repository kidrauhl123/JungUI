import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Bars, Dots, Orbit, TypeLine } from './vizzes'
import RippleField from './RippleField'

const CARDS = [
  { id: 'a', bg: '#c14a26', ink: '#f4e7cf', body: 'rgba(244,231,207,.72)', title: 'Patterns\n& Parts', desc: 'Reusable building blocks I keep coming back to.', viz: 'bars' },
  { id: 'b', bg: '#f5f3ef', ink: '#2b2723', body: 'rgba(43,39,35,.62)',   title: 'Field Notes',     desc: 'Half-formed ideas, caught before they slip away.', viz: 'type' },
  { id: 'c', bg: '#3080ff', ink: '#eaf2ff', body: 'rgba(234,242,255,.8)', title: 'Signals',         desc: 'How small rules add up to large behavior.', viz: 'dots' },
  { id: 'd', bg: '#1f9d57', ink: '#eafff2', body: 'rgba(234,255,242,.8)', title: 'Flow',            desc: 'Motion that reveals — never just decoration.', viz: 'ripple' },
  { id: 'e', bg: '#1c1917', ink: '#e7e5e4', body: 'rgba(231,229,228,.66)',title: 'Deep Work',       desc: 'Fewer things, given full attention.', viz: 'orbit' },
]

function Graphic({ type, ink, w, h }) {
  return (
    <div style={{ color: ink, width: '100%', height: '100%' }}>
      {type === 'bars' && <Bars />}
      {type === 'dots' && <Dots />}
      {type === 'orbit' && <Orbit />}
      {type === 'type' && <TypeLine />}
      {type === 'ripple' && <RippleField className="vizsvg" stroke={ink} lines={9} width={w} height={h} />}
    </div>
  )
}

/* ============ MOBILE: draggable swipe stack (innerWidth < 640) ============ */
const STACK = [
  { x: 0, y: 0, rotation: 0, scale: 1 },
  { x: 12, y: 6, rotation: 2.5, scale: 0.97 },
  { x: 22, y: 12, rotation: 4, scale: 0.94 },
  { x: 30, y: 18, rotation: 5, scale: 0.91 },
  { x: 36, y: 24, rotation: 6, scale: 0.88 },
]
const ENTRANCE = [{ x: -30, y: 60 }, { x: -15, y: 75 }, { x: 0, y: 90 }, { x: 15, y: 105 }, { x: 30, y: 120 }]
const POS_SPRING = { type: 'spring', stiffness: 200, damping: 25 }
const SNAP_BACK = { type: 'spring', stiffness: 500, damping: 30 }
const FLING = { type: 'spring', stiffness: 300, damping: 25 }
const SETTLE = { type: 'spring', stiffness: 300, damping: 30 }

function StackCard({ card, pos, entrance, isTop, zIndex, index, hasEntered, onSwipe }) {
  const x = useMotionValue(0)
  const [grabbing, setGrabbing] = useState(false)
  const pending = useRef(false)
  const rotate = useTransform(x, [-330, 0, 330], [-12, 0, 12])

  // when the fling crosses 330, hand the card to the back of the deck and snap x home
  useEffect(() => x.on('change', (v) => {
    if (pending.current && Math.abs(v) >= 330) { pending.current = false; onSwipe(); animate(x, 0, SETTLE) }
  }), [x, onSwipe])

  return (
    <motion.div className="scard" style={{ width: 300, height: 420, marginLeft: -150, marginTop: -210, zIndex }}
      initial={{ x: pos.x + entrance.x, y: pos.y + entrance.y, rotate: pos.rotation, scale: 0.9 * pos.scale, opacity: 0 }}
      animate={{ x: pos.x, y: pos.y, rotate: pos.rotation, scale: pos.scale, opacity: 1 }}
      transition={{ ...POS_SPRING, delay: hasEntered ? 0 : 0.3 + 0.05 * index }}>
      <motion.div className="scard-drag" style={{ x, rotate, cursor: isTop ? (grabbing ? 'grabbing' : 'grab') : 'auto' }}
        drag={isTop ? 'x' : false} dragElastic={0.8} dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => setGrabbing(true)}
        onDragEnd={(e, info) => {
          setGrabbing(false)
          const r = x.get(), v = info.velocity.x
          if (Math.abs(r) >= 40 || Math.abs(v) >= 300) {
            const dir = Math.abs(r) >= 40 ? Math.sign(r) : Math.sign(v)
            pending.current = true
            animate(x, 380 * dir, { ...FLING, velocity: v })
          } else animate(x, 0, SNAP_BACK)
        }}>
        <div className="face" style={{ background: card.bg, display: 'flex', flexDirection: 'column' }}>
          <div className="face-graphic" style={{ marginTop: 18, marginRight: 18, marginBottom: 14, marginLeft: 18, width: 264, height: 160 }}>
            <Graphic type={card.viz} ink={card.ink} w={264} h={160} />
          </div>
          <h2 className="face-title" style={{ color: card.ink, fontSize: 28, lineHeight: '30px', padding: '0 18px' }}>{card.title}</h2>
          <p className="face-body" style={{ color: card.body, fontSize: 15, lineHeight: '22px', padding: '10px 18px 0' }}>{card.desc}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MobileStack() {
  const [order, setOrder] = useState(() => CARDS.map((c) => c.id))
  const [entered, setEntered] = useState(false)
  useEffect(() => { const t = setTimeout(() => setEntered(true), 800); return () => clearTimeout(t) }, [])
  const swipe = (id) => setOrder((o) => { const r = o.indexOf(id); return r < 0 ? o : [...o.slice(0, r), ...o.slice(r + 1), id] })
  return (
    <div className="deck-stage" style={{ width: 360, height: 460 }}>
      <motion.div style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}>
        {order.map((id, r) => {
          const card = CARDS.find((c) => c.id === id)
          const pos = STACK[r] || STACK[STACK.length - 1]
          const entrance = ENTRANCE[CARDS.findIndex((c) => c.id === id)] || ENTRANCE[0]
          return <StackCard key={id} card={card} pos={pos} entrance={entrance} isTop={r === 0}
            zIndex={CARDS.length - r} index={r} hasEntered={entered} onSwipe={() => swipe(id)} />
        })}
      </motion.div>
    </div>
  )
}

/* ============ DESKTOP: width-responsive fanned row (innerWidth >= 640) ============ */
// real default fan positions (o table) — x is multiplied by offsetMultiplier so spacing tracks window width
const FAN = [
  { x: -306, y: -10, rotation: -8 },
  { x: -151, y: 20, rotation: 4 },
  { x: 0, y: -41, rotation: -2 },
  { x: 147, y: 16, rotation: 1 },
  { x: 310, y: -19, rotation: 5 },
]
// jitter applied to the non-selected cards when one card is expanded (a table)
const JITTER = [
  { x: 49, y: 48, rotation: -4 }, { x: 31, y: 49, rotation: -2 }, { x: 0, y: 51, rotation: 0 },
  { x: -10, y: 53, rotation: 2 }, { x: -33, y: 57, rotation: 3 },
]
const NORMAL = { cardW: 228, cardH: 288, padding: 16, graphicW: 196, graphicH: 120, titleSize: 28, titleLineH: 30 }
const SELECTED = { cardW: 360, cardH: 464, padding: 24, graphicW: 312, graphicH: 192, titleSize: 36, titleLineH: 36 }
const SPREAD = { offsetX: 0, offsetY: 184, spacing: 70 }
const LAYOUT = { type: 'spring', visualDuration: 0.4, bounce: 0.15 }
const BODY_FADE = { type: 'spring', visualDuration: 0.2, bounce: 0 }

function DesktopCluster() {
  const [vw, setVw] = useState(1080)
  const stageRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const on = () => setVw(Math.min(window.innerWidth, stageRef.current?.clientWidth || window.innerWidth))
    on(); window.addEventListener('resize', on)
    const ro = new ResizeObserver(on)
    if (stageRef.current) ro.observe(stageRef.current)
    const t = setTimeout(() => setEntered(true), 1100)
    return () => { window.removeEventListener('resize', on); ro.disconnect(); clearTimeout(t) }
  }, [])

  // available stage width 360→980 maps to a wider fan while staying inside the section
  const safeWidth = Math.max(360, Math.min(980, vw))
  const tt = (safeWidth - 360) / 620
  const offsetMultiplier = 0.45 + 0.55 * tt
  const clusterScale = 0.78 + 0.22 * tt
  const n = CARDS.length

  return (
    <div ref={stageRef} className="cluster-stage" style={{ width: '100%', height: 520 }} onClick={() => setSelected(null)}>
      <motion.div style={{ position: 'absolute', left: '50%', top: '50%', width: 900, height: 520, marginLeft: -450, marginTop: -260 }}
        initial={{ filter: 'blur(8px)', scale: 0.8 * clusterScale, opacity: 0, y: 120 }}
        animate={{ filter: 'blur(0px)', scale: clusterScale, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}>
        {CARDS.map((card, i) => {
          const isSel = selected === card.id
          const cfg = isSel ? SELECTED : NORMAL
          let jx, jy, rot, sc
          if (isSel) { jx = 0; jy = -40; rot = 0; sc = 1 }
          else if (selected === null) { const o = FAN[i]; jx = o.x * offsetMultiplier; jy = o.y; rot = o.rotation; sc = 1 }
          else { const b = JITTER[i]; jx = i * SPREAD.spacing - ((n - 1) * SPREAD.spacing) / 2 + b.x; jy = SPREAD.offsetY + b.y; rot = b.rotation; sc = 0.7 }
          return (
            <motion.div key={card.id} className="ccard"
              style={{ marginLeft: -cfg.cardW / 2, marginTop: -cfg.cardH / 2, zIndex: isSel ? 50 : i + 1 }}
              initial={{ x: jx, y: jy + (entered ? 0 : 24), rotate: rot, scale: sc, opacity: 0 }}
              animate={{ x: jx, y: jy, rotate: rot, scale: sc, opacity: 1 }}
              whileHover={selected === null ? { scale: 1.04, y: jy - 10 } : {}}
              transition={{ ...LAYOUT, delay: entered ? 0 : 0.5 + 0.05 * i }}
              onClick={(e) => { e.stopPropagation(); setSelected((s) => (s === card.id ? null : card.id)) }}>
              <motion.div className="face" style={{ background: card.bg, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                animate={{ width: cfg.cardW, height: cfg.cardH }} transition={LAYOUT}>
                <div className="face-graphic" style={{ marginTop: cfg.padding, marginRight: cfg.padding, marginBottom: 12, marginLeft: cfg.padding, width: cfg.graphicW, height: cfg.graphicH }}>
                  <Graphic type={card.viz} ink={card.ink} w={cfg.graphicW} h={cfg.graphicH} />
                </div>
                <h2 className="face-title" style={{ color: card.ink, fontSize: cfg.titleSize, lineHeight: `${cfg.titleLineH}px`, padding: `0 ${cfg.padding}px`, transition: 'font-size .4s cubic-bezier(0.34,1.56,0.64,1)' }}>{card.title}</h2>
                <motion.p className="face-body" style={{ color: card.body, fontSize: 16, lineHeight: '24px', padding: `10px ${cfg.padding}px 0` }}
                  animate={{ opacity: isSel ? 1 : 0, filter: isSel ? 'blur(0px)' : 'blur(4px)' }} transition={BODY_FADE}>{card.desc}</motion.p>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ============ switch by viewport, exactly like the reference (innerWidth < 640) ============ */
export default function CardStack() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < 640)
    on(); window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  return (
    <div className="item" style={{ width: '100%' }}>
      <div style={{ minHeight: mobile ? 500 : 560, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {mobile ? <MobileStack /> : <DesktopCluster />}
      </div>
      <div className="caption">
        <div className="name">卡片堆叠 / 卡片簇</div>
        <div className="note">窄屏(&lt;640)拖最上卡甩走→绕回牌堆底 · 宽屏(≥640)点卡片展开、其余散开 · 完全照参考站机制实现</div>
      </div>
    </div>
  )
}
