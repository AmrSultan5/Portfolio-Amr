import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs. The default ('/') emits /assets/… which 404s when the
  // site is served from a subpath such as GitHub Pages' username.github.io/repo/,
  // producing a blank white page. './' works from a subpath and from a domain
  // root, so the same build deploys anywhere.
  base: './',
  plugins: [react(), tailwindcss()],
})
