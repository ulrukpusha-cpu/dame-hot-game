import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuration Vite (équivalent next.config pour ce projet).
 * Variables d'environnement publiques : préfixer par VITE_ (ex: VITE_WS_URL).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // Préfixe des assets en production (équivalent assetPrefix Next)
  base:
    process.env.NODE_ENV === 'production' && process.env.BASE_URL
      ? process.env.BASE_URL
      : '',

  // Variables d'environnement exposées au client (préfixe VITE_)
  envPrefix: 'VITE_',

  // Serveur de dev : en-têtes pour Telegram Mini App / iframe
  server: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // Preview (build) : mêmes en-têtes
  preview: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
