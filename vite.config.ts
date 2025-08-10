// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Reindirizza le richieste che iniziano con /api
      '/api': {
        // Durante lo sviluppo, le punta al server locale di Vercel
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
    },
  },
})
