import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Multi-page build: the shell (index.html) plus one HTML entry per specimen.
// Each specimen builds into its own bundle and is embedded by the shell via an
// iframe, so specimens can use any tech stack without colliding.
const entry = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: entry('./index.html'),
        'reveal-card': entry('./specimens/reveal-card/index.html'),
        'card-stack': entry('./specimens/card-stack/index.html'),
        'graphic-language': entry('./specimens/graphic-language/index.html'),
        'motion-patterns': entry('./specimens/motion-patterns/index.html'),
        'telegraph-text': entry('./specimens/telegraph-text/index.html'),
        'rainbow-telegraph-text': entry('./specimens/rainbow-telegraph-text/index.html'),
        'programmatic-sky': entry('./specimens/programmatic-sky/index.html'),
        'gsap-buttons': entry('./specimens/gsap-buttons/index.html'),
        'base-cta-button': entry('./specimens/base-cta-button/index.html'),
        'theme-toggle': entry('./specimens/theme-toggle/index.html'),
        'patterns-maxima': entry('./patterns/maxima-card-stack/index.html'),
        'patterns-sky': entry('./patterns/programmatic-sky/index.html'),
      },
    },
  },
})
