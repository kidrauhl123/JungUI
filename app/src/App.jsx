import RevealCard from './components/RevealCard'
import CardStack from './components/CardStack'
import GraphicLanguage from './components/GraphicLanguage'
import GsapButtons from './components/GsapButtons'
import { MaximaCardStackPage, MotionPatterns } from './components/MotionPatterns'
import { ProgrammaticSkyPage, ProgrammaticSkyPreview } from './components/ProgrammaticSky'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  if (window.location.pathname === '/patterns/maxima-card-stack') {
    return <MaximaCardStackPage />
  }

  if (window.location.pathname === '/patterns/programmatic-sky') {
    return <ProgrammaticSkyPage />
  }

  return (
    <div className="app">
      <header>
        <h1>JungUI · 收藏库</h1>
        <p>简洁、克制地收藏我喜欢的样式。每一件都是活的——看到对味的就留下，慢慢积累成自己的语言。</p>
      </header>

      <section className="cat">
        <h2>卡片 · Cards</h2>
        <div className="grid">
          <RevealCard />
        </div>
      </section>

      <section className="cat">
        <h2>卡片堆叠 · Card Stack</h2>
        <div className="grid">
          <CardStack />
        </div>
      </section>

      <section className="cat">
        <h2>图形语言 · Graphic Systems</h2>
        <div className="grid">
          <GraphicLanguage />
        </div>
      </section>

      <section className="cat">
        <h2>动效模式 · Motion Patterns</h2>
        <div className="grid">
          <MotionPatterns />
        </div>
      </section>

      <section className="cat">
        <h2>背景 · Atmospheric Backgrounds</h2>
        <div className="grid">
          <ProgrammaticSkyPreview />
        </div>
      </section>

      <section className="cat">
        <h2>按钮 · Buttons</h2>
        <div className="grid">
          <GsapButtons />
        </div>
      </section>

      <section className="cat">
        <h2>切换 · Toggles</h2>
        <div className="grid">
          <ThemeToggle />
        </div>
      </section>
    </div>
  )
}
