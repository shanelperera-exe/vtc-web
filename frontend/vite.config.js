import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    // Use env-driven dev proxy target to avoid hardcoded localhost defaults
    proxy: (() => {
      const target = process.env.VITE_DEV_API_PROXY || process.env.VITE_API_BASE_URL;
      return target
        ? {
            // proxy API calls to backend during dev; both user and admin share same origin but different paths
            '/api': {
              target,
              changeOrigin: true,
            },
          }
        : undefined;
    })(),
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
})
