import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Critical Core: React itself. This rarely changes.
          'react-core': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          // UI Library: Icons are large, split them out so they don't block the initial render frame.
          'ui-libs': ['lucide-react'],
        }
      }
    }
  }
});