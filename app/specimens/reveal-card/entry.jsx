import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import RevealCard from '../../src/components/RevealCard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><RevealCard /></div></div>
  </StrictMode>,
)
reportHeight()
