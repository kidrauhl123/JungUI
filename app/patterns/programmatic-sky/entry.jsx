import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { ProgrammaticSkyPage } from '../../src/components/ProgrammaticSky.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProgrammaticSkyPage />
  </StrictMode>,
)
