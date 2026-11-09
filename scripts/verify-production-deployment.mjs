// Verify the *same commit* that GitHub CI checked is actually being served by
// the production domain. A generic HTTP 200 / sitemap check cannot prove this.
// Cloudflare Pages publishes site-release.json from CF_PAGES_COMMIT_SHA.
// The main-push workflow polls briefly because GitHub and Pages build separately.
import { setTimeout as delay } from 'node:timers/promises';

const origin = 'https://deadpixeltest.cc';
const targetSha = (process.argv[2] || process.env.GITHUB_SHA || '').trim().toLowerCase();
if (!/^[a-f0-9]{40}$/.test(targetSha)) {
  console.error('Expected a complete 40-character Git commit SHA.');
  process.exit(2);
}

const maxWaitMs = Number(process.env.DEPLOY_MAX_WAIT_MS || 600000);
if (!Number.isFinite(maxWaitMs) || maxWaitMs < 0 || maxWaitMs > 900000) {
  throw Error('DEPLOY_MAX_WAIT_MS must be between 0 and 900000');
}
const deadline = Date.now() + maxWaitMs;
let attempt = 0, lastFinding = '';

while (true) {
  attempt++;
  const url = origin + '/site-release.json?commit=' + targetSha.slice(0,12) + '&attempt=' + attempt;
  try {
    const response = await fetch(url, {
      redirect:'error',
      cache:'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'User-Agent': 'DeadPixelTest-ReleaseVerifier/1.0'
      },
      signal: AbortSignal.timeout(12000)
    });
    if (response.status !== 200) {
      lastFinding='release marker HTTP ' + response.status;
    } else {
      const marker = await response.json();
      const actualSha = String(marker?.commitSha || '').toLowerCase();
      if (marker?.schemaVersion!==1 || marker?.site!==origin || marker?.branch!=='main'
        || !/^[a-f0-9]{40}$/.test(actualSha)) {
        lastFinding='malformed or unrelated production marker (site/branch/SHA)';
      } else if (actualSha === targetSha) {
        console.log('PASS Cloudflare custom domain is serving Git commit ' + actualSha +
          ' (verified via production-only release marker, attempt ' + attempt + ')');
        process.exit(0);
      } else {
        lastFinding='production commit '+actualSha.slice(0,12)+' does not match CI '+targetSha.slice(0,12);
      }
    }
  } catch (e) {
    lastFinding='release marker request/JSON error: ' + String(e).slice(0,240);
  }
  if (Date.now()>=deadline) {
    console.error('FAIL: latest commit not confirmed on '+origin+' after '+attempt+' checks.');
    console.error('Last observation: '+lastFinding);
    console.error('Check Cloudflare Workers & Pages > Project > Deployments: Git repo, production branch main, automatic deployments, build npm run build, output dist, and build logs. A green GitHub CI is not deployment proof.');
    process.exit(1);
  }
  if (attempt===1 || attempt%4===0)
    console.log('WAIT '+lastFinding+'; checking again for main deployment.');
  await delay(Math.min(15000,Math.max(0,deadline-Date.now())));
}
