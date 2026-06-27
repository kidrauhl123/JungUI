import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { MaximaCardStackPage } from '../../src/components/MotionPatterns.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MaximaCardStackPage />
  </StrictMode>,
)
