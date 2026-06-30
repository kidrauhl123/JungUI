import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import TelegraphText from '../../src/components/TelegraphText.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><TelegraphText variant="rainbow" /></div></div>
  </StrictMode>,
)
reportHeight()
