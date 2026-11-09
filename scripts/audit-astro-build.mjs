import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const isCloudflarePreview = process.env.CF_PAGES === '1' && !!process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main';
const raw=isCloudflarePreview?'':process.env.PUBLIC_SITE_URL?.trim(),origin=raw?new URL(raw).origin:'';
const priority=['/','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns'];
const planned=['/laptop-screen-dead-pixel-test/','/dead-pixel-fixer/','/phone-screen-dead-pixel-test/','/what-is-a-dead-pixel/','/dead-pixel-line-test/','/image-retention-test/','/screen-resolution-test/','/screen-contrast-test/','/pt-br/','/pt-br/pixel-morto-notebook/','/pt-br/pixel-morto-iphone/','/pt-br/reparar-pixel-preso/','/pt-br/o-que-e-dead-pixel/','/pt-br/teste-de-cores/'];
const errors=[],xml=readFileSync('dist/sitemap.xml','utf8'),robots=readFileSync('dist/robots.txt','utf8'),locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const taskSpecificGuides=new Map([
 ['/laptop-screen-dead-pixel-test/','Laptop screen symptoms: what to check next'],
 ['/pt-br/pixel-morto-notebook/','Pixel morto no notebook: como interpretar o sintoma'],
 ['/dead-pixel-fixer/','Does this symptom need a pixel fixer?'],
 ['/pt-br/reparar-pixel-preso/','Pixel preso: qual próximo passo é seguro?']
]);
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
 if(path==='/image-retention-test/' && (!html.includes('Manufacturer OLED panel-care guides')||!html.includes('www.samsung.com/sg/support/displays/')||!html.includes('www.lg.com/us/support/help-library/'))){
  errors.push('Retention guide missing source-verified manufacturer references');
 }
 const symptomTitle=taskSpecificGuides.get(path);
 if(symptomTitle && (!html.includes(symptomTitle)||!html.includes('data-symptom-decision')||!html.includes('<details')||!html.includes('www.dell.com/support/kbdoc/'))){
  errors.push('Missing independent static laptop/fixer triage content on '+path);
 }

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
  const shouldIndex=priority.includes(path)||planned.includes(path);
  if(shouldIndex&&noindex)errors.push('Legacy route unexpectedly noindex '+path);
  if(!shouldIndex&&!noindex)errors.push('Excluded route unexpectedly indexable '+path);
  if(shouldIndex&&!locs.includes(expected))errors.push('Sitemap missing published URL '+expected);
  if(!shouldIndex&&locs.includes(expected))errors.push('Sitemap includes excluded URL '+expected);
 }else if(canon.length||!/<meta name="robots" content="noindex,nofollow"/.test(html))errors.push('Domainless route must be noindex without canonical '+path);
 if(path.startsWith('/pt-br/')&&!/lang="pt-BR"/.test(html))errors.push('Missing pt-BR language '+path);
}
if(origin){if(!robots.includes(origin+'/sitemap.xml'))errors.push('robots sitemap mismatch');}
else if(locs.length||/Sitemap:/i.test(robots))errors.push('Domainless sitemap/robots leaks an origin');
if(xml.includes('<lastmod>'))errors.push('Unverified lastmod');

if(origin){
 // Every advertised Sitemap location must be a real, indexable, self-canonical static HTML page.
 const visited=new Set();
 for(const loc of locs){
  if(visited.has(loc)){errors.push('Duplicate sitemap loc '+loc);continue;}
  visited.add(loc);
  let url;
  try{url=new URL(loc);}catch{errors.push('Malformed sitemap loc '+loc);continue;}
  if(url.origin!==origin||url.search||url.hash){errors.push('Unexpected origin or query in sitemap '+loc);continue;}
  const path=url.pathname;
  if(path!=='/'&&path.endsWith('/'))errors.push('Sitemap uses noncanonical trailing slash '+path);
  const expected=origin+path;
  if(loc!==expected)errors.push('Sitemap loc not canonical '+loc);
  const output=join('dist',path==='/'?'index.html':path.slice(1)+'.html');
  if(!existsSync(output)){errors.push('Sitemap URL has no generated HTML '+path);continue;}
  const html=readFileSync(output,'utf8');
  const canonicalTags=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)];
  if(canonicalTags.length!==1||!canonicalTags[0][0].includes('href="'+expected+'"'))errors.push('Sitemap URL has missing/incorrect self-canonical '+path);
  if(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html))errors.push('Sitemap includes noindex HTML '+path);
  if(!/<title>[^<]+<\/title>/i.test(html))errors.push('Sitemap URL has no static title '+path);
 }
 // All hreflang destinations in the sitemap must actually be included as indexable pages.
 for(const match of xml.matchAll(/<xhtml:link\b[^>]*href="([^"]+)"/g)){
  if(!visited.has(match[1]))errors.push('Hreflang targets non-indexable URL '+match[1]);
 }
 // Keep the legacy alias available to old clients without advertising a duplicate index page.
 const legacy=join('dist','tests/dead-pixel.html');
 if(!existsSync(legacy))errors.push('Legacy dead-pixel route is missing');
 else{
  const html=readFileSync(legacy,'utf8');
  if(!/name="robots" content="noindex,nofollow"/.test(html))errors.push('Legacy dead-pixel alias must not be indexable');
  if(!/<link\b[^>]*rel="canonical" href="[^"]+\/"/.test(html))errors.push('Legacy dead-pixel alias must canonicalize to homepage');
 }
 const redirects=join('dist','_redirects');
 if(!existsSync(redirects))errors.push('Missing Cloudflare Pages redirect rules');
 else {
  const rules=readFileSync(redirects,'utf8');
  if(!/^\/tests\/dead-pixel\s+\/\s+301\s*$/m.test(rules))errors.push('Missing 301 from legacy pixel URL to root');
  if(!/^\/pt-br\/\s+\/pt-br\s+301\s*$/m.test(rules))errors.push('Missing pt-BR canonical trailing-slash 301');
 }
}

// The three legacy editorial guides are indexable and must not undermine
// the safe static-pixel workflow with unverified fixes or fake expert teams.
const editorialPages=[
 ['dead-pixel-vs-stuck-pixel-ultimate-guide','Dead vs. Stuck Pixels: How to Check and What to Do','/dead-pixel-fixer'],
 ['ips-glow-vs-backlight-bleed-guide','IPS Glow vs. Backlight Bleed: How to Compare Them','/tests/uniformity'],
 ['monitor-calibration-guide-no-hardware','Monitor Color Check Without a Colorimeter: Practical Limits','/screen-contrast-test']
];
const unsafeBlogClaims=[
 'How to Identify Defects with 100% Accuracy',
 'The "Epileptic" Software Fix',
 'The Pressure Method',
 'The Heat Method',
 '90% of the way there',
 'Display Engineering Team',
 'Color Science Team',
 'Tech Lab'
];
for(const [slug,headline,internalLink] of editorialPages){
 const path='/blog/'+slug;
 const file=join('dist','blog',slug+'.html');
 if(!existsSync(file)){errors.push('Missing indexed guide '+path);continue;}
 const html=readFileSync(file,'utf8');
 if(!html.includes('<h1')||!html.includes(headline))errors.push('Guide missing its specific crawlable H1 '+path);
 if(!html.includes('href="'+internalLink+'"'))errors.push('Guide lacks relevant internal tool link '+path);
 if(!html.includes('By <a href="/about">DeadPixelTest</a>'))errors.push('Guide lacks honest visible author label '+path);
 if(unsafeBlogClaims.some(term=>html.includes(term)))errors.push('Guide retains unsafe or unsupported claim '+path);
 const schemaScripts=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
 const nodes=[];
 for(const item of schemaScripts){
  try{
   const json=JSON.parse(item[1]);
   nodes.push(...(Array.isArray(json['@graph'])?json['@graph']:[json]));
  }catch(e){errors.push('Invalid JSON-LD in guide '+path+': '+String(e));}
 }
 const article=nodes.find(node=>node['@type']==='BlogPosting');
 if(!article||article.headline!==headline||article.author?.name!=='DeadPixelTest')
  errors.push('Missing/mismatched honest BlogPosting metadata '+path);
 if(!nodes.some(node=>node['@type']==='BreadcrumbList'&&node.itemListElement?.length===3))
  errors.push('Missing guide breadcrumb schema '+path);
 if(origin){
  const canonical=origin+path;
  if(!locs.includes(canonical))errors.push('Published guide missing from sitemap '+path);
  if(article?.mainEntityOfPage!==canonical)errors.push('BlogPosting URL not canonical '+path);
 }else if(!html.includes('name="robots" content="noindex,nofollow"'))
  errors.push('Domainless guide should remain noindex '+path);
}
if(origin){
 const html=readFileSync(join('dist','index.html'),'utf8');
 const script=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
 const nodes=script.flatMap(m=>{try{const j=JSON.parse(m[1]);return j['@graph']||[j];}catch{return [];}});
 if(!nodes.some(x=>x['@type']==='WebSite'&&x.name==='DeadPixelTest'&&x.url===origin+'/'))
  errors.push('Homepage missing valid WebSite site-name structured data');
}

// Cloudflare's production pages.dev alias must not compete with the owned domain.
const headersPath=join('dist','_headers');
if(!existsSync(headersPath))errors.push('Missing Cloudflare Pages index isolation headers');
else{
 const headers=readFileSync(headersPath,'utf8');
 if(!headers.includes('https://:project.pages.dev/*')||!headers.includes('https://:version.:project.pages.dev/*'))errors.push('Missing pages.dev host-specific noindex headers');
 if((headers.match(/X-Robots-Tag: noindex/g)||[]).length<2)errors.push('Missing noindex directive for both Pages host shapes');
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS: legacy routes and 14 newly index-admitted landing pages audited (noindex only on preview/domainless).');
