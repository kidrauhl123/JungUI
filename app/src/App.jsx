import { useEffect, useRef, useState } from 'react'
import { GALLERY } from './specimens.js'

// Each specimen renders inside its own iframe sandbox and reports its content
// height up to here, so the iframe sizes itself to fit.
function SpecimenFrame({ id, tech }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(280)

  useEffect(() => {
    function onMessage(e) {
      const node = ref.current
      if (!node || e.source !== node.contentWindow) return
      if (e.data && e.data.source === 'jungui-specimen' && e.data.height) {
        setHeight(e.data.height)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="frame-card">
      <span className="frame-tech">{tech}</span>
      <iframe
        ref={ref}
        className="frame"
        src={`/specimens/${id}/`}
        title={id}
        loading="lazy"
        scrolling="no"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>JungUI · 收藏库</h1>
        <p>简洁、克制地收藏我喜欢的样式。每一件都活在自己的沙盒里——任何技术栈都能并排收藏，互不干扰。</p>
      </header>

      {GALLERY.map((group) => (
        <section className="cat" key={group.cat}>
          <h2>{group.cat}</h2>
          <div className="frame-grid">
            {group.items.map((item) => (
              <SpecimenFrame key={item.id} id={item.id} tech={item.tech} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
