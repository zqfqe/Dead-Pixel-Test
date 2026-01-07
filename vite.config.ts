import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Save bandwidth
    target: 'esnext', // Modern browsers, smaller code
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React separate as it rarely changes (better for browser cache)
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          // CRITICAL: Do NOT manually chunk lucide-react. 
          // Letting Vite handle it automatically enables Tree-Shaking to remove unused icons.
        }
      }
    }
  }
});