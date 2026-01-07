import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Save bandwidth in production
    target: 'esnext', // Modern browsers, smaller bundles
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Stable vendor chunk for caching
          'vendor': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          // Let Vite automatically handle lucide-react for tree-shaking
        }
      }
    }
  }
});