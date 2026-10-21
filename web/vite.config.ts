import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The browser talks only to Vite; /api is forwarded to the FastAPI server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8010' },
  },
})
