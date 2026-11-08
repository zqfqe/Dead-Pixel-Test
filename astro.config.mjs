import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const configuredSiteUrl = process.env.PUBLIC_SITE_URL?.trim();
let site;

if (configuredSiteUrl) {
  const parsed = new URL(configuredSiteUrl);
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error('PUBLIC_SITE_URL must be the HTTPS origin only, e.g. https://your-domain.com');
  }
  site = parsed.origin;
}

export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react()],
});
