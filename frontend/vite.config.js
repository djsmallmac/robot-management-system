import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/auth': 'http://backend:8000',
      '/robot': 'http://backend:8000',
      '/ws': { target: 'ws://backend:8000', ws: true },
    }
  }
})
