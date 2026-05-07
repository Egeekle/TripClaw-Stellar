import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'util', 'stream', 'events', 'crypto'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy all ZeroClaw API calls through Vite to avoid CORS
      '/zc-api': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zc-api/, ''),
        ws: true, // also proxy WebSocket
      },
    },
  },
})
