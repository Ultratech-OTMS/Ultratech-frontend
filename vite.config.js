import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3002',
        target: 'https://ultratech-backend-1.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        // target: 'http://localhost:3002',
        target: 'https://ultratech-backend-1.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
