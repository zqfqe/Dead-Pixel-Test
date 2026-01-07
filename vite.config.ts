import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  ssr: {
    // Force these dependencies to be bundled into the server build.
    // This resolves issues where Node.js cannot find named exports 
    // (like 'Helmet') from CommonJS packages during the SSG process.
    noExternal: ['react-helmet-async', 'lucide-react', 'react-router-dom']
  }
});