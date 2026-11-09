import { spawnSync } from 'node:child_process';

// This site's custom domain is live. Pages builds on main can publish
// canonical/indexable HTML even when PUBLIC_SITE_URL was not configured in
// the Cloudflare dashboard. Local builds and branch previews stay noindex.
const PRODUCTION_ORIGIN = 'https://deadpixeltest.cc';
const isPagesBuild = process.env.CF_PAGES === '1';
const isProduction = isPagesBuild && process.env.CF_PAGES_BRANCH === 'main';
const isPreview = isPagesBuild && !!process.env.CF_PAGES_BRANCH && !isProduction;
const env = { ...process.env };

if (isPreview) {
  delete env.PUBLIC_SITE_URL;
} else if (isProduction) {
  const configured = env.PUBLIC_SITE_URL?.trim();
  if (configured && new URL(configured).origin !== PRODUCTION_ORIGIN) {
    throw new Error(
      'Cloudflare production PUBLIC_SITE_URL disagrees with the verified custom domain. ' +
      'Set it to ' + PRODUCTION_ORIGIN + ' (or remove the override).'
    );
  }
  env.PUBLIC_SITE_URL = PRODUCTION_ORIGIN;
  console.log('Cloudflare main production: canonical/indexing enabled for ' + PRODUCTION_ORIGIN);
}

function run(script) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['run', script], {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('sitemap');
run('build:astro');
run('audit:routes');
