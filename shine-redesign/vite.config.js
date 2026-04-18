import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const port = Number(process.env.PORT) || 5173

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
