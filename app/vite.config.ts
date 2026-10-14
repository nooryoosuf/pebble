import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// Base path: "/" for Cloudflare Pages custom domains and local dev.
// GitHub Pages project sites override via PAGES_BASE=/pebble/ (see workflow).
const base = process.env.PAGES_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Pebble — Daily Business Studies',
        short_name: 'Pebble',
        description: 'A playful daily Business Studies learning platform for Grade 7.',
        theme_color: '#58cc02',
        background_color: '#fff9f0',
        display: 'standalone',
        orientation: 'portrait-primary',
        // scope + start_url intentionally omitted: vite-plugin-pwa derives
        // them from `base`, so both "/" (Cloudflare) and "/pebble/" (GitHub) work.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell precached; lesson/illustration assets cached on use.
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // SPA fallback so deep links open offline too.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'pebble-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
        ],
      },
    }),
  ],
})
