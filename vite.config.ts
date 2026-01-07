import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2015',
    minify: 'esbuild', // Standard, fast minification
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    // Removed manualChunks to let Vite automatically tree-shake unused code
  }
});