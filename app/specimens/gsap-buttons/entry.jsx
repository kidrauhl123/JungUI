import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import GsapButtons from '../../src/components/GsapButtons.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><GsapButtons /></div></div>
  </StrictMode>,
)
reportHeight()
