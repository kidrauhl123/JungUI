import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import RippleField from './RippleField'

const SIG = [0.2, 0.7, 0.2, 1]
const TRANS = [0.16, 1, 0.3, 1]

export default function RevealCard() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setOpen(false); setTimeout(() => setOpen(true), 120) } }),
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const show = { opacity: 1, filter: 'blur(0px)', y: 0 }
  const hide = { opacity: 0, filter: 'blur(7px)', y: 7 }

  return (
    <div className="item">
      <div className="card" ref={ref}>
        <RippleField className="flowsvg" stroke="#2f7bd4" lines={12} width={264} height={300} />
        <div className="brand">JungUI</div>
        <motion.div className="sheet" animate={{ y: open ? '20%' : '0%' }} transition={{ duration: 0.66, ease: TRANS }}>
          <h3 className="sheet-h">Take <span className="g">your</span> time.</h3>
          <motion.p animate={open ? show : hide} transition={{ duration: 0.55, ease: SIG, delay: open ? 0.3 : 0 }}>
            白色主体承载内容，顶部露 1/5 流动线条；打开时白层下滑、文字 blur-in 渐入。
          </motion.p>
          <motion.span className="cta" animate={open ? show : hide} transition={{ duration: 0.55, ease: SIG, delay: open ? 0.42 : 0 }}>
            了解更多 →
          </motion.span>
        </motion.div>
      </div>
      <div className="caption">
        <div className="name">
          揭示卡片 <button className="replay" onClick={() => { setOpen(false); setTimeout(() => setOpen(true), 60) }}>↻ 重播</button>
        </div>
        <div className="note">正弦荡漾背景 · 白层揭示 · 初次播一次 · 默认光标 · 无 lift / ring</div>
      </div>
    </div>
  )
}
