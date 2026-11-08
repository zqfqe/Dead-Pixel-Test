const raw=process.env.PUBLIC_SITE_URL?.trim();
if(!raw){console.log('SKIP: PUBLIC_SITE_URL is not configured; domainless deployment remains noindex.');process.exit(0);}
const origin=new URL(raw).origin;
const required=['/','/pt-br','/laptop-screen-dead-pixel-test','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/image-retention-test','/pt-br/pixel-morto-notebook'];
const failures=[];
for(const path of required){
 let res;
 try{res=await fetch(origin+path,{redirect:'follow'});}catch(e){failures.push(path+': '+e);continue;}
 if(res.status!==200)failures.push(path+': HTTP '+res.status);
 const html=await res.text();
 const canon=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
 const expected=origin+(path==='/'?'/':path);
 if(canon.length!==1||!canon[0][0].includes('href="'+expected+'"'))failures.push(path+': canonical mismatch');
 if(/name=["']robots["'][^>]*noindex/i.test(html))failures.push(path+': unexpected noindex');
 if(!/<title>[^<]+<\/title>/i.test(html))failures.push(path+': missing title');
 console.log('CHECK '+path+' '+res.status);
}
const [sr,rr]=await Promise.all([fetch(origin+'/sitemap.xml'),fetch(origin+'/robots.txt')]);
const sitemap=await sr.text(),robots=await rr.text();
if(!sr.ok)failures.push('sitemap HTTP '+sr.status);
if(!rr.ok)failures.push('robots HTTP '+rr.status);
for(const p of ['/','/pt-br','/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient'])if(!sitemap.includes('<loc>'+origin+(p==='/'?'/':p)+'</loc>'))failures.push('sitemap missing '+p);
if(!robots.includes(origin+'/sitemap.xml'))failures.push('robots missing sitemap');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS configured production domain checks');
