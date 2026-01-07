import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2015', // Support slightly older browsers while keeping bundles small
    minify: 'esbuild', // Use esbuild for fast and efficient minification
    cssMinify: true,   // Ensure CSS is minified to fix "Minify CSS" error
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000, // Increase warning limit slightly
    rollupOptions: {
      output: {
        // Critical: Smart Code Splitting to fix "Long main-thread tasks"
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-helmet-async'],
          'router': ['react-router-dom'],
          'ui-icons': ['lucide-react'], // Isolate the heavy icon library
        }
      }
    }
  }
});