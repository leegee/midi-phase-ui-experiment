import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  publicDir: 'assets',

  build: {
    sourcemap: true,
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "name": "MIDI Phase Experiments",
        "short_name": "MIDI Phase",
        "start_url": ".",
        "description": "Experiments in phasing MIDI with interferance patterns",
        "display": "standalone",
        "theme_color": "#000000",
        "background_color": "#242424",
        "icons": [
          {
            "src": "pwa-64x64.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "maskable-icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      },
      workbox: {
        swDest: "assets/sw.js",
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});