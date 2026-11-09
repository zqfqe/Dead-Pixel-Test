import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
 
// A green GitHub build does not prove that Cloudflare has deployed it.
// Cloudflare Pages supplies CF_PAGES_COMMIT_SHA for each Git-backed build.
// Publish an unguessable-by-assumption, explicit commit witness only for main.
// Do not publish a fabricated release marker on previews or local builds.
if (isProduction) {
  const sha = String(env.CF_PAGES_COMMIT_SHA || '').toLowerCase().trim();
  if (!/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error(
      'CF_PAGES_COMMIT_SHA is missing/invalid in the Cloudflare production build. ' +
      'Do not publish an untraceable release; inspect Pages Git integration and system environment.'
    );
  }
  const marker = {
    schemaVersion: 1,
    site: PRODUCTION_ORIGIN,
    branch: 'main',
    commitSha: sha,
  };
  writeFileSync(join('dist', 'site-release.json'), JSON.stringify(marker) + '\n', 'utf8');
  console.log('Wrote Cloudflare production release marker for commit ' + sha);
}

