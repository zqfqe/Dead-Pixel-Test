const origin = process.env.PRODUCTION_ORIGIN || 'https://deadpixeltest.cc';
const required = [
  '/', '/pt-br', '/laptop-screen-dead-pixel-test', '/tests/refresh-rate',
  '/tests/local-dimming', '/tests/color-gradient', '/image-retention-test',
  '/pt-br/pixel-morto-notebook'
];
const failures = [];
const pages = new Map();
async function get(path) {
  const url = origin + path;
  let response;
  for (let attempt = 0; attempt < 24; attempt++) {
    try {
      response = await fetch(url, {redirect:'follow',headers:{'user-agent':'DeadPixelTest-Production-Smoke/1.0','cache-control':'no-cache'}});
      if (response.status === 200) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  if (!response || response.status !== 200) {
    failures.push(path + ': expected HTTP 200, got ' + (response?.status ?? 'network error'));
    return null;
  }
  const final = new URL(response.url);
  if (final.pathname !== path) failures.push(path + ': redirected to ' + final.pathname);
  const html = await response.text();
  pages.set(path, html);
  const canonicals = [...html.matchAll(/<link\\b[^>]*rel=["']canonical["'][^>]*>/gi)].map(m=>m[0]);
  if (canonicals.length !== 1) failures.push(path + ': expected exactly one canonical, got ' + canonicals.length);
  else {
    const href = canonicals[0].match(/href=["']([^"']+)["']/i)?.[1];
    const expected = origin + (path === '/' ? '/' : path);
    if (href !== expected) failures.push(path + ': canonical ' + href + ' expected ' + expected);
  }
  if (!/<title>[^<]+<\\/title>/i.test(html)) failures.push(path + ': missing title');
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) failures.push(path + ': missing meta description');
  if (/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) failures.push(path + ': production page is noindex');
  console.log('PASS HTTP/SEO ' + path);
  return html;
}
for (const path of required) await get(path);
const root = pages.get('/');
const pt = pages.get('/pt-br');
if (root && !/hreflang=["']pt-BR["']/.test(root)) failures.push('/ : missing pt-BR hreflang');
if (pt && !/<html[^>]+lang=["']pt-BR["']/.test(pt)) failures.push('/pt-br: wrong document language');
if (pt && !/pixel morto|pixel morto/i.test(pt)) failures.push('/pt-br: missing Portuguese first-rendered content');
const [sitemap, robots] = await Promise.all([
 fetch(origin+'/sitemap.xml',{headers:{'cache-control':'no-cache'}}).then(r=>r.text()),
 fetch(origin+'/robots.txt',{headers:{'cache-control':'no-cache'}}).then(r=>r.text())
]);
for (const path of ['/','/pt-br','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient']) {
 const loc=origin+(path==='/'?'/':path);
 if (!sitemap.includes('<loc>'+loc+'</loc>')) failures.push('sitemap missing '+loc);
}
if (!robots.includes(origin+'/sitemap.xml')) failures.push('robots.txt does not reference sitemap');
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\\/loc>/g)].map(m=>m[1]);
if (locs.length < 40) failures.push('sitemap unexpectedly short: '+locs.length+' URLs');
if (new Set(locs).size !== locs.length) failures.push('sitemap contains duplicate URLs');
console.log('Sitemap URLs: '+locs.length);
if (failures.length) {
 console.error('PRODUCTION SMOKE FAILED\\n'+failures.join('\\n'));
 process.exit(1);
}
console.log('PASS: production HTTP, clean URLs, canonical, hreflang, sitemap and robots checks.');
