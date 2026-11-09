// Live HTTP/SEO invariants for the verified custom domain. These checks do
// not prove that a particular GitHub commit has finished deploying or that
// Google has indexed or ranked a page.
const origin = 'https://deadpixeltest.cc';
const configured = process.env.PUBLIC_SITE_URL?.trim();
if (configured && new URL(configured).origin !== origin) {
  throw Error('Production smoke must target the verified origin '+origin);
}

const planned = [
  '/', '/laptop-screen-dead-pixel-test', '/dead-pixel-fixer',
  '/phone-screen-dead-pixel-test', '/what-is-a-dead-pixel',
  '/dead-pixel-line-test', '/image-retention-test',
  '/screen-resolution-test', '/screen-contrast-test',
  '/pt-br', '/pt-br/pixel-morto-notebook', '/pt-br/pixel-morto-iphone',
  '/pt-br/reparar-pixel-preso', '/pt-br/o-que-e-dead-pixel',
  '/pt-br/teste-de-cores'
];
const legacy = [
  '/tests/refresh-rate', '/tests/local-dimming',
  '/tests/color-gradient', '/tests/audio-sync',
  '/tests/test-patterns'
];
const indexed = [...new Set([...planned, ...legacy])];
const hreflangPairs = [
  ['/','/pt-br'],
  ['/laptop-screen-dead-pixel-test','/pt-br/pixel-morto-notebook'],
  ['/dead-pixel-fixer','/pt-br/reparar-pixel-preso'],
  ['/what-is-a-dead-pixel','/pt-br/o-que-e-dead-pixel']
];
const failures = [];
const htmlByPath = new Map();

const request = async(path, redirect = 'follow') => {
  try {
    return await fetch(origin + path, {
      redirect, signal: AbortSignal.timeout(15000),
      headers:{'User-Agent':'DeadPixelTest-Production-Smoketest/1.2'}
    });
  } catch(e) {
    failures.push(path+': request failed: '+String(e));
    return null;
  }
};

for (const path of indexed) {
  const response = await request(path);
  if (!response) continue;
  if (response.status !== 200) {
    failures.push(path+': expected HTTP 200, got '+response.status);
    continue;
  }
  if (response.url !== origin+path) failures.push(path+': canonical-path response URL mismatch '+response.url);
  const html = await response.text();
  htmlByPath.set(path,html);
  const canons=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
  if (canons.length!==1 || !canons[0][0].includes('href="'+origin+path+'"'))
    failures.push(path+': missing/incorrect self-canonical');
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)
    || /\bnoindex\b/i.test(response.headers.get('x-robots-tag')||'')) {
    failures.push(path+': published page is blocked by noindex');
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(path+': missing title');
  if (!/<meta\b[^>]*name=["']description["']/i.test(html)) failures.push(path+': missing description');
  if (!/<h1[\s>]/i.test(html) && !path.startsWith('/tests/')) failures.push(path+': missing server-rendered H1');
  console.log('CHECK '+path+' HTTP '+response.status+' indexable=true');
}

for (const [en,pt] of hreflangPairs) {
  for (const path of [en,pt]) {
    const html=htmlByPath.get(path);
    if (!html) continue;
    for (const [locale,target] of [['en',en],['pt-BR',pt]]) {
      if (!html.includes('hreflang="'+locale+'" href="'+origin+target+'"'))
        failures.push(path+': missing reciprocal '+locale+' hreflang -> '+target);
    }
  }
}

const [sitemapRes,robotsRes]=await Promise.all([
  request('/sitemap.xml'),request('/robots.txt')
]);
if (sitemapRes && !sitemapRes.ok) failures.push('sitemap HTTP '+sitemapRes.status);
if (robotsRes && !robotsRes.ok) failures.push('robots HTTP '+robotsRes.status);
const sitemap=sitemapRes?.ok ? await sitemapRes.text() : '';
const robots=robotsRes?.ok ? await robotsRes.text() : '';
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if (locs.length!==50) failures.push('V1.2 sitemap should have 50 indexable URLs; got '+locs.length);
if (new Set(locs).size!==locs.length) failures.push('Duplicate sitemap <loc> entries');
for (const loc of locs) {
  if (!loc.startsWith(origin+'/')) failures.push('Sitemap contains wrong origin: '+loc);
}
for (const path of indexed) {
  if (!locs.includes(origin+path)) failures.push('Sitemap missing published index URL '+path);
}
if (!robots.includes('Sitemap: '+origin+'/sitemap.xml'))
  failures.push('robots.txt does not advertise the production sitemap');
if (/Disallow:\s*\//i.test(robots))
  failures.push('robots.txt blocks crawling');

const checkRedirect=async(from,to)=>{
  const response=await request(from,'manual');
  if (!response) return;
  if (![301,308].includes(response.status)) {
    failures.push(from+': expected permanent redirect, got '+response.status);
    return;
  }
  const location=response.headers.get('location');
  if (!location || new URL(location,origin).toString()!==origin+to) {
    failures.push(from+': expected redirect to '+to+', got '+location);
  }
};
for (const [from,to] of [
  ['/tests/dead-pixel','/'], ['/tests/dead-pixel/','/'],
  ['/pt-br/','/pt-br'],
  ['/laptop-screen-dead-pixel-test/','/laptop-screen-dead-pixel-test']
]) await checkRedirect(from,to);

const missing=await request('/__deadpixeltest_http404_probe__','manual');
if (missing && missing.status!==404)
  failures.push('Unknown route must return HTTP 404; got '+missing.status);

if (failures.length) {
  for(const f of failures)console.error('FAIL '+f);
  process.exit(1);
}
console.log('PASS live production domain: 15 planned + 5 legacy routes, 50 sitemap URLs, reciprocal hreflang, redirects and HTTP 404.');
