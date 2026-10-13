import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Repository name on GitHub Pages: https://<user>.github.io/pebble/
  // Local dev is unaffected (still served from /).
  base: "/pebble/",
  plugins: [react(), tailwindcss()],
})
