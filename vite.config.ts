import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group all NPM dependencies into one file to reduce network requests
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Group shared UI components (buttons, layout, etc.) to prevent request waterfalls
          if (id.includes('components/common')) {
            return 'common-ui';
          }
        }
      }
    }
  }
});