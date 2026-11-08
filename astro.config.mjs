import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://deadpixeltest.cc',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [react()],
});
