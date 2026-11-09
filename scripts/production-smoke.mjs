// Verify the ACTUAL published origin; gated pages intentionally stay noindex.
const raw=process.env.PUBLIC_SITE_URL?.trim();
if(!raw){console.log('SKIP: PUBLIC_SITE_URL is not configured; no live-domain claim.');process.exit(0);}
const origin=new URL(raw).origin;
const indexed=['/','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns'];
const gated=['/pt-br','/laptop-screen-dead-pixel-test','/dead-pixel-fixer','/image-retention-test','/pt-br/pixel-morto-notebook','/pt-br/teste-de-cores'];
const failures=[];
const request=async(path,redirect='follow')=>{
 try{return await fetch(origin+path,{redirect,signal:AbortSignal.timeout(15000)});}
 catch(e){failures.push(path+': request failed: '+String(e));return null;}
};
const checkPage=async(path,shouldIndex)=>{
 const res=await request(path);
 if(!res)return;
 if(res.status!==200){failures.push(path+': HTTP '+res.status);return;}
 const html=await res.text();
 const expected=origin+path;
 if(res.url!==expected)failures.push(path+': final URL differs from canonical '+res.url);
 const canon=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
 if(canon.length!==1||!canon[0][0].includes('href="'+expected+'"'))failures.push(path+': missing/incorrect canonical');
 const noindex=/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
 if(shouldIndex&&noindex)failures.push(path+': unexpected noindex on established URL');
 if(!shouldIndex&&!noindex)failures.push(path+': SERP-gated page is indexable without review');
 if(!/<title>[^<]+<\/title>/i.test(html))failures.push(path+': missing title');
 if(!/<meta\b[^>]*name=["']description["']/i.test(html))failures.push(path+': missing description');
 console.log('CHECK '+path+' '+res.status+' indexable='+!noindex);
};
for(const path of indexed)await checkPage(path,true);
for(const path of gated)await checkPage(path,false);
const [sr,rr]=await Promise.all([request('/sitemap.xml'),request('/robots.txt')]);
if(sr&&!sr.ok)failures.push('sitemap HTTP '+sr.status);
if(rr&&!rr.ok)failures.push('robots HTTP '+rr.status);
const sitemap=sr?.ok?await sr.text():'',robots=rr?.ok?await rr.text():'';
const locations=new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
for(const p of indexed)if(!locations.has(origin+p))failures.push('sitemap missing indexable URL '+p);
for(const p of gated)if(locations.has(origin+p))failures.push('sitemap includes unreviewed noindex URL '+p);
if(!robots.includes('Sitemap: '+origin+'/sitemap.xml'))failures.push('robots missing correct sitemap declaration');
const checkRedirect=async(source,destination)=>{
 const res=await request(source,'manual');
 if(!res)return;
 if(![301,308].includes(res.status)){failures.push(source+': expected permanent redirect, got '+res.status);return;}
 const target=res.headers.get('location');
 if(!target||new URL(target,origin).toString()!==origin+destination)failures.push(source+': expected redirect to '+destination+', got '+target);
};
await checkRedirect('/tests/dead-pixel','/');
await checkRedirect('/tests/dead-pixel/','/');
await checkRedirect('/pt-br/','/pt-br');
await checkRedirect('/laptop-screen-dead-pixel-test/','/laptop-screen-dead-pixel-test');
const missing=await request('/__deadpixeltest_http404_probe__','manual');
if(missing&&missing.status!==404)failures.push('Unknown route should be HTTP 404; got '+missing.status);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS production domain: indexable pages, gated pages, sitemap, redirects and real 404.');
