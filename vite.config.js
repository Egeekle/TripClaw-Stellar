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
      '/zc-api': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zc-api/, ''),
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-stellar': ['@stellar/stellar-sdk', '@stellar/freighter-api'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'leaflet', 'react-leaflet'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Attempt to silence the esbuild warning if possible via build target
    target: 'esnext',
  }
})

