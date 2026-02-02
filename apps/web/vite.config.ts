import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { fs: { strict: false } },
  define: { global: 'globalThis' },
  esbuild: { target: 'es2022' },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios', 'socket.io-client'],
          'vendor-ui': ['lucide-react', 'recharts']
        }
      }
    }
  }
})
