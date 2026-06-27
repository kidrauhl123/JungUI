import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import ThemeToggle from '../../src/components/ThemeToggle.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><ThemeToggle /></div></div>
  </StrictMode>,
)
reportHeight()
