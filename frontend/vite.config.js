import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // TailwindCSS v4 - PostCSS ishlatilmaydi
  ],
  server: {
    port: 5173,
    proxy: {
      // Backend API so'rovlarini proxy qilish
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
