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
          // 1. Vendor Chunk: React and core libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // 2. Common UI Chunk: Group small shared components to reduce request chains
          if (id.includes('components/common')) {
            return 'common-ui';
          }
          // 3. Layout Chunk: Sidebar, Header, Footer
          if (id.includes('components/layout')) {
            return 'layout';
          }
        }
      }
    }
  }
});