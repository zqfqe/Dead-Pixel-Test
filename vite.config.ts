import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production to reduce request overhead
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Vendor Chunk: Group all third-party libraries (React, Lucide, Router)
          // This prevents the browser from fetching small chunks for each library.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // 2. Common UI Chunk: Group all shared components (Buttons, Headers, SEO, Intros)
          // This fixes the waterfall effect shown in your screenshot.
          if (id.includes('components/common')) {
            return 'common-ui';
          }
          // 3. Layout Chunk: Sidebar and Layout elements
          if (id.includes('components/layout')) {
            return 'layout';
          }
        }
      }
    }
  }
});