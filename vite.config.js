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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@stellar')) return 'vendor-stellar';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('leaflet')) return 'vendor-ui';
            return 'vendor';
          }
        }

      }
    },
    // Attempt to silence the esbuild warning if possible via build target
    target: 'esnext',
  }
})

