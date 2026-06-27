import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../_frame.css'
import { reportHeight } from '../_autoheight.js'
import { MotionPatterns } from '../../src/components/MotionPatterns.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="cat"><div className="grid"><MotionPatterns /></div></div>
  </StrictMode>,
)
reportHeight()
