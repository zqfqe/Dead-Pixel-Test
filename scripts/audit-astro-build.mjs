import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const raw=process.env.PUBLIC_SITE_URL?.trim();
const origin=raw?new URL(raw).origin:'';
const required=['/','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns','/laptop-screen-dead-pixel-test/','/dead-pixel-fixer/','/phone-screen-dead-pixel-test/','/what-is-a-dead-pixel/','/dead-pixel-line-test/','/image-retention-test/','/screen-resolution-test/','/screen-contrast-test/','/pt-br/','/pt-br/pixel-morto-notebook/','/pt-br/pixel-morto-iphone/','/pt-br/reparar-pixel-preso/','/pt-br/o-que-e-dead-pixel/','/pt-br/teste-de-cores/'];
const errors=[],sitemap=readFileSync('dist/sitemap.xml','utf8'),robots=readFileSync('dist/robots.txt','utf8'),locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
for(const path of required){
 const file=join('dist',path==='/'?'index.html':path.split('/').filter(Boolean).join('/')+'.html');
 if(!existsSync(file)){errors.push('Missing static HTML '+file);continue;}
 const html=readFileSync(file,'utf8'),canon=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)];
 if(!/<title>[^<]+<\/title>/.test(html))errors.push('Missing title '+path);
 if(!/<meta name="description"/.test(html))errors.push('Missing description '+path);
 if(!/<h1[\s>]/.test(html)&&!path.startsWith('/tests/'))errors.push('Missing static H1 '+path);
 if(origin){
  const expected=origin+(path==='/'?'/':path.replace(/\/+$/,''));
  if(canon.length!==1||!canon[0][0].includes('href="'+expected+'"'))errors.push('Canonical mismatch '+path);
  if(!locs.includes(expected))errors.push('Sitemap missing '+expected);
  if(/name="robots" content="noindex/i.test(html))errors.push('Unexpected noindex '+path);
 }else if(canon.length||!/<meta name="robots" content="noindex,nofollow"/.test(html))errors.push('Domainless build must have no canonical and noindex '+path);
 if(path.startsWith('/pt-br/')&&!/lang="pt-BR"/.test(html))errors.push('Missing pt-BR lang '+path);
}
if(origin){if(!robots.includes(origin+'/sitemap.xml'))errors.push('robots sitemap origin mismatch');if(locs.length<40)errors.push('Sitemap too short '+locs.length);if(new Set(locs).size!==locs.length)errors.push('Duplicate sitemap URLs');}
else{if(locs.length)errors.push('Domainless sitemap must be empty');if(/Sitemap:/i.test(robots))errors.push('Domainless robots must not name a guessed sitemap');}
if(sitemap.includes('<lastmod>'))errors.push('Unverified lastmod in sitemap');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS '+required.length+' routes; '+(origin?'canonical/sitemap '+origin:'domainless noindex mode'));
