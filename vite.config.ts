import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  ssr: {
    // Forces Vite to bundle these dependencies for the server build,
    // avoiding ESM/CJS interop issues in Node.js (prerender step).
    noExternal: ['react-helmet-async']
  }
});