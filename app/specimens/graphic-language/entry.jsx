import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import GraphicLanguage from '../../src/components/GraphicLanguage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><GraphicLanguage /></div></div>
  </StrictMode>,
)
reportHeight()
