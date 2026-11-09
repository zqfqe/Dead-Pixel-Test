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


// Answer-first GEO quality gate: every original V1.2 page gets a specific,
// extractable answer in the static HTML. This is an editorial consistency
// check, NOT proof of AI citation, indexing, or a special Google ranking factor.
const geoPaths=['/',
 '/laptop-screen-dead-pixel-test','/dead-pixel-fixer',
 '/phone-screen-dead-pixel-test','/what-is-a-dead-pixel',
 '/dead-pixel-line-test','/image-retention-test',
 '/screen-resolution-test','/screen-contrast-test',
 '/pt-br','/pt-br/pixel-morto-notebook',
 '/pt-br/pixel-morto-iphone','/pt-br/reparar-pixel-preso',
 '/pt-br/o-que-e-dead-pixel','/pt-br/teste-de-cores'
];
const geoQuestions=new Set();
for(const path of geoPaths){
 const htmlFile=join('dist',path==='/'?'index.html':path.slice(1)+'.html');
 if(!existsSync(htmlFile)){errors.push('GEO page has no output '+path);continue;}
 const html=readFileSync(htmlFile,'utf8');
 const section=html.match(/<section\b[^>]*data-geo-answer[^>]*>[\s\S]*?<\/section>/);
 if(!section){errors.push('GEO answer absent in initial static HTML '+path);continue;}
 const snippet=section[0];
 const question=snippet.match(/<h2\b[^>]*id="quick-answer-heading"[^>]*>([^<]+)<\/h2>/)?.[1];
 if(!question || geoQuestions.has(question))errors.push('GEO answer question missing or duplicated '+path);
 if(question)geoQuestions.add(question);
 const br=path==='/pt-br'||path.startsWith('/pt-br/');
 if(!snippet.includes(br?'RESPOSTA DIRETA':'IN BRIEF / DIRECT ANSWER'))
  errors.push('GEO answer locale heading missing '+path);
 if(!snippet.includes(br?'Limite da ferramenta':'What this cannot prove'))
  errors.push('GEO answer lacks explicit limits '+path);
 if(!snippet.includes(br?'O que verificar':'Practical checks') && path!=='/')
  errors.push('GEO answer missing practical checks '+path);
 if((snippet.match(/<li\b/g)||[]).length<2)errors.push('GEO answer is too thin '+path);
 if(path==='/'&&!snippet.includes('href="https://www.dell.com/support/kbdoc/'))
  errors.push('Homepage answer lacks manufacturer reference');
 if(!/<h1[\s>]/.test(html))errors.push('GEO page missing crawlable H1 '+path);
 if(/"@type"\s*:\s*"FAQPage"/.test(html))
  errors.push('GEO page adds ineligible FAQPage rich-result markup '+path);
 // The answer must not be client-only, and must retain the established locale.
 if(br&&!html.includes('lang="pt-BR"'))errors.push('GEO Portuguese answer language mismatch '+path);
 else if(!br&&!html.includes('lang="en"'))errors.push('GEO English answer language mismatch '+path);
}
// Landing-page JSON-LD describes visible tools and actual locale; it must not
// invent ratings, testimonials or lab-tested outcomes.
for(const path of geoPaths.filter(x=>x!=='/')){
 const html=readFileSync(join('dist',path.slice(1)+'.html'),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
 let valid=false;
 for(const match of scripts){
  try{
   const data=JSON.parse(match[1]);
   const entries=data['@graph']||[data];
   if(entries.some(x=>['WebPage','WebApplication'].includes(x['@type'])&&x.inLanguage===(path.startsWith('/pt-br')?'pt-BR':'en')))valid=true;
   if(entries.some(x=>x.aggregateRating||x.review||x.ratingValue))errors.push('Unsupported review or rating claims '+path);
  }catch{errors.push('Invalid GEO JSON-LD '+path)}
 }
 if(!valid)errors.push('Structured data does not identify page and visible locale '+path);
}

// Existing URLs should not depend entirely on a hydrated React island for
// their primary explanation. They need distinct indexable metadata and real
// per-tool guidance in the original Astro HTML.
const enhancedLegacyPaths=["/tests/uniformity","/tests/text-clarity","/tests/color-distance","/tests/response-time","/tests/gamma","/tests/viewing-angle","/tests/brightness","/tests/contrast","/tests/matrix","/tools/burn-in-wiper","/tools/input-lag","/tools/reaction-time","/tools/double-click-test","/tools/mouse-polling","/tools/keyboard","/tools/controller","/tools/touch","/tools/color-blindness","/tools/webcam","/tools/speaker-test","/tools/ruler","/tools/ppi-calculator"];
const descriptions=new Map();
for(const path of enhancedLegacyPaths){
 const file=join('dist',path.slice(1)+'.html');
 if(!existsSync(file)){errors.push('Missing enhanced tool HTML '+path);continue;}
 const html=readFileSync(file,'utf8');
 const match=html.match(/<meta name="description" content="([^"]+)"/i);
 if(!match||match[1].length<65||match[1].includes('Free browser-based display and device diagnostics.'))
  errors.push('Legacy tool has generic or missing meta description '+path);
 else{
  if(descriptions.has(match[1]))errors.push('Duplicate tool meta description '+path+' and '+descriptions.get(match[1]));
  descriptions.set(match[1],path);
 }
 if(!/<title>[^<]+\| DeadPixelTest<\/title>/i.test(html))
  errors.push('Legacy tool has no descriptive branded title '+path);
 if(!html.includes('id="legacy-static-guide"')||!html.includes('Practical inspection steps')||
    !html.includes('What the result cannot prove')||!html.includes('<ol')||!html.includes('<ul'))
  errors.push('Legacy tool lacks unique server-rendered guidance '+path);
}
for(const [path,expected] of [
 ['/blog','Screen Testing Guides'],['/about','About DeadPixelTest'],['/contact','Contact DeadPixelTest'],
 ['/privacy-policy','Privacy Policy'],['/terms-of-service','Terms of Service']
]){
 const file=join('dist',path.slice(1)+'.html');
 if(!existsSync(file)){errors.push('Missing static informational route '+path);continue;}
 const html=readFileSync(file,'utf8');
 if(!html.includes('<title>'+expected))errors.push('Informational route has generic SEO title '+path);
}

// Main tool pages must expose actual crawlable links to the corrected help
// articles; including routes in sitemap alone is not a complete link strategy.
const homeHtml=readFileSync(join('dist','index.html'),'utf8');
for(const slug of [
 'dead-pixel-vs-stuck-pixel-ultimate-guide',
 'ips-glow-vs-backlight-bleed-guide',
 'monitor-calibration-guide-no-hardware'
]){
 if(!homeHtml.includes('href="/blog/'+slug+'"'))errors.push('Homepage lacks contextual guide link '+slug);
}
if(!homeHtml.includes('Browse all screen testing guides'))errors.push('Homepage blog hub CTA missing');
const laptopHtml=readFileSync(join('dist','laptop-screen-dead-pixel-test.html'),'utf8');
if(!laptopHtml.includes('href="/blog"'))errors.push('Site footer lacks crawlable blog link');


// Ensure all 22 individually indexed legacy tools have a real HTML anchor
// on a public server-rendered page, not only inside the React nav or sitemap.
for (const path of enhancedLegacyPaths) {
 if (!homeHtml.includes('href="'+path+'"'))
  errors.push('Tool has no homepage HTML discovery link '+path);
}
if (!homeHtml.includes('href="/tests/test-patterns"'))
 errors.push('Original test-pattern guide lacks a discoverable homepage link');

const trustRoutes=[
 ['/about','About DeadPixelTest','How we approach testing'],
 ['/contact','Contact &amp; Feedback','Open GitHub Issues'],
 ['/privacy-policy','Privacy Policy','Hosting requests'],
 ['/terms-of-service','Terms of Use','No repair or measurement guarantee']
];
for (const [path,heading,bodyText] of trustRoutes) {
 const html=readFileSync(join('dist',path.slice(1)+'.html'),'utf8');
 if (!html.includes('id="main-content"') || !html.includes('<h1') ||
     !html.includes(heading) || !html.includes(bodyText) ||
     !html.includes('href="/privacy-policy"') && path==='/about')
  errors.push('Trust/policy page lacks complete static HTML '+path);
 if (html.includes('<astro-island'))
  errors.push('Trust/policy page unexpectedly still depends on client-only React '+path);
 if (html.length < 3500)
  errors.push('Trust/policy page unexpectedly thin in the initial HTML '+path);
}

// Validate the published sitemap as an actual discovery graph. A self-link
// does not count; every indexable destination needs an HTML inbound link.
if (origin) {
 const targetPaths=new Set(locs.map(url=>new URL(url).pathname));
 const inbound=new Map([...targetPaths].map(path=>[path,0]));
 const seenTitles=new Map(),seenDescriptions=new Map();
 for(const source of targetPaths) {
  const html=readFileSync(join('dist',source==='/'?'index.html':source.slice(1)+'.html'),'utf8');
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description=html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]+)"/i)?.[1];
  if(!title || !description || description.length<40)
   errors.push('Sitemap route has missing/weak title or description '+source);
  for(const [value,registry,label] of [[title,seenTitles,'title'],[description,seenDescriptions,'description']]) {
   if(!value)continue;
   if(registry.has(value))errors.push('Duplicate indexable '+label+': '+source+' and '+registry.get(value));
   else registry.set(value,source);
  }
  for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
   try{
    const target=new URL(match[1],origin+source);
    if(target.origin!==origin || target.search)continue;
    const path=target.pathname.replace(/\/+$/,'')||'/';
    if(targetPaths.has(path) && path!==source)
     inbound.set(path,inbound.get(path)+1);
   }catch{}
  }
 }
 for(const [path,count] of inbound) {
  if(path!=='/' && count===0)errors.push('Indexable sitemap URL orphaned from HTML links: '+path);
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
