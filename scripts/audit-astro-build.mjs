import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const raw=process.env.PUBLIC_SITE_URL?.trim(),origin=raw?new URL(raw).origin:'';
const priority=['/','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns'];
const planned=['/laptop-screen-dead-pixel-test/','/dead-pixel-fixer/','/phone-screen-dead-pixel-test/','/what-is-a-dead-pixel/','/dead-pixel-line-test/','/image-retention-test/','/screen-resolution-test/','/screen-contrast-test/','/pt-br/','/pt-br/pixel-morto-notebook/','/pt-br/pixel-morto-iphone/','/pt-br/reparar-pixel-preso/','/pt-br/o-que-e-dead-pixel/','/pt-br/teste-de-cores/'];
const errors=[],xml=readFileSync('dist/sitemap.xml','utf8'),robots=readFileSync('dist/robots.txt','utf8'),locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const staticGuides=new Map([
 ['/tests/refresh-rate','How to interpret a frame-skipping and browser FPS check'],
 ['/tests/local-dimming','How to inspect local dimming, halos and blooming'],
 ['/tests/color-gradient','How to identify visible color banding'],
 ['/tests/audio-sync','How to check perceived audio and video timing'],
 ['/tests/test-patterns','Using display patterns for visual checks']
]);

for(const path of [...priority,...planned]){
 const file=join('dist',path==='/'?'index.html':path.split('/').filter(Boolean).join('/')+'.html');
 if(!existsSync(file)){errors.push('Missing HTML '+path);continue;}
 const html=readFileSync(file,'utf8'),canon=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)];
 const guideTitle=staticGuides.get(path);
 if(guideTitle&&(!html.includes(guideTitle)||!html.includes('Practical inspection steps')||!html.includes('What the result cannot prove'))){
  errors.push('Legacy GSC route missing indexable static guide content: '+path);
 }
 if(path==='/'&&!html.includes('id="main-content"'))errors.push('Homepage missing accessible main target');
 if(!/<title>[^<]+<\/title>/.test(html))errors.push('Missing title '+path);
 if(!/<meta name="description"/.test(html))errors.push('Missing description '+path);
 if(!/<h1[\s>]/.test(html)&&!path.startsWith('/tests/'))errors.push('Missing H1 '+path);
 if(origin){
  const expected=origin+(path==='/'?'/':path.replace(/\/+$/,''));
  if(canon.length!==1||!canon[0][0].includes('href="'+expected+'"'))errors.push('Canonical mismatch '+path);
  const noindex=/name="robots" content="noindex,nofollow"/.test(html);
  const shouldIndex=priority.includes(path);
  if(shouldIndex&&noindex)errors.push('Legacy route unexpectedly noindex '+path);
  if(!shouldIndex&&!noindex)errors.push('SERP-gated landing page must remain noindex '+path);
  if(shouldIndex&&!locs.includes(expected))errors.push('Sitemap missing legacy URL '+expected);
  if(!shouldIndex&&locs.includes(expected))errors.push('Sitemap includes unverified landing page '+expected);
 }else if(canon.length||!/<meta name="robots" content="noindex,nofollow"/.test(html))errors.push('Domainless route must be noindex without canonical '+path);
 if(path.startsWith('/pt-br/')&&!/lang="pt-BR"/.test(html))errors.push('Missing pt-BR language '+path);
}
if(origin){if(!robots.includes(origin+'/sitemap.xml'))errors.push('robots sitemap mismatch');}
else if(locs.length||/Sitemap:/i.test(robots))errors.push('Domainless sitemap/robots leaks an origin');
if(xml.includes('<lastmod>'))errors.push('Unverified lastmod');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS: legacy indexable routes and 14 SERP-gated landing pages audited.');
