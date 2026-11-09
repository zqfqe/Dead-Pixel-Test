// Run only after verifying the expected commit's /site-release.json marker.
// This tests production *content*, not just route existence or canonical tags.
const origin = 'https://deadpixeltest.cc';
const pages=[
  '/', '/laptop-screen-dead-pixel-test', '/dead-pixel-fixer',
  '/phone-screen-dead-pixel-test', '/what-is-a-dead-pixel',
  '/dead-pixel-line-test', '/image-retention-test',
  '/screen-resolution-test', '/screen-contrast-test',
  '/pt-br', '/pt-br/pixel-morto-notebook',
  '/pt-br/pixel-morto-iphone', '/pt-br/reparar-pixel-preso',
  '/pt-br/o-que-e-dead-pixel', '/pt-br/teste-de-cores'
];
const failures=[];
const parseSchemas=html=>[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map(x=>{try{return JSON.parse(x[1])}catch{return null}}).filter(Boolean);
const graph=html=>parseSchemas(html).flatMap(x=>x['@graph']||[x]);
const inspect=async(path)=>{
  try{
    const response=await fetch(origin+path,{
      redirect:'follow',cache:'no-store',
      headers:{'Cache-Control':'no-cache','User-Agent':'DeadPixelTest-Production-GEO-Smoke/1.0'},
      signal:AbortSignal.timeout(15000)
    });
    if(response.status!==200)throw Error('HTTP '+response.status);
    const html=await response.text();
    const br=path==='/pt-br'||path.startsWith('/pt-br/');
    for(const [label,condition] of [
      ['static answer section',html.includes('data-geo-answer')&&html.includes('id="quick-answer"')],
      ['unique answer question',html.includes('id="quick-answer-heading"')],
      ['correct direct-answer language',html.includes(br?'RESPOSTA DIRETA':'IN BRIEF / DIRECT ANSWER')],
      ['explicit caveat',html.includes(br?'Limite da ferramenta':'What this cannot prove')],
      ['visible practical guidance',html.includes(br?'O que verificar':path==='/'?'Clean the glass':'Practical checks')],
      ['html locale',html.includes('lang="'+(br?'pt-BR':'en')+'"')]
    ])if(!condition)failures.push(path+' missing '+label);
    if(!html.includes('data-editorial-review')||!html.includes('rel="author"')||
       !html.includes('datetime="2026-11-09"'))
      failures.push(path+' missing visible author or reviewed date');
    const typed=graph(html);
    const entry=typed.find(x=>['WebPage','WebApplication'].includes(x['@type']) && x.inLanguage===(br?'pt-BR':'en'));
    const brand=typed.find(x=>x['@type']==='Organization' && x.name==='DeadPixelTest');
    const validAuthor=entry?.author?.name==='DeadPixelTest' ||
      (Boolean(brand?.['@id']) && entry?.author?.['@id']===brand['@id']);
    if(!entry || !validAuthor || entry.dateModified!=='2026-11-09')
      failures.push(path+' source data has missing author or dateModified');
    if(path==='/'){
      const app=typed.find(x=>x['@type']==='WebApplication');
      const org=typed.find(x=>x['@type']==='Organization');
      const page=typed.find(x=>x['@type']==='WebPage');
      if(!app || app.sameAs!=='https://github.com/zqfqe/Dead-Pixel-Test')
        failures.push('homepage missing verified sameAs project source');
      if(!org || org.name!=='DeadPixelTest' || !page || page.author?.['@id']!==org['@id'])
        failures.push('homepage organization and author entity disconnected');
      const logo=html.match(/<img\b[^>]*src="\/logo\.svg"[^>]*>/i)?.[0];
      if(!logo || !/alt="DeadPixelTest home"/.test(logo))
        failures.push('homepage branding image has missing functional alt');
      if(!html.includes('<span aria-hidden="true">DeadPixelTest</span>'))
        failures.push('homepage brand name may be duplicated for assistive technology');
    }
    console.log('CHECK GEO '+path+' '+(br?'pt-BR':'en'));
  }catch(error){
    failures.push(path+' request failed: '+String(error));
  }
};
for(let i=0;i<pages.length;i+=4)await Promise.all(pages.slice(i,i+4).map(inspect));

try{
  const response=await fetch(origin+'/about',{cache:'no-store',
    headers:{'Cache-Control':'no-cache','User-Agent':'DeadPixelTest-Production-GEO-Smoke/1.0'},
    signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const html=await response.text();
  if(!html.includes('How we describe evidence and sources'))
    failures.push('/about lacks visible source-methodology section');
  if(!html.includes('Editorial identity and verifiable changes') ||
     !html.includes('https://github.com/zqfqe/Dead-Pixel-Test'))
    failures.push('/about lacks identifiable author and real project repository');
  for(const host of ['www.dell.com/support/kbdoc','www.samsung.com/sg/support','developer.mozilla.org/en-US/docs'])
    if(!html.includes(host))failures.push('/about lacks expected source reference '+host);
}catch(error){failures.push('/about request failed: '+String(error))}
for(const slug of [
 'dead-pixel-vs-stuck-pixel-ultimate-guide',
 'ips-glow-vs-backlight-bleed-guide',
 'monitor-calibration-guide-no-hardware'
]){
 try {
  const response=await fetch(origin+'/blog/'+slug,{
   cache:'no-store',headers:{'Cache-Control':'no-cache'},
   signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw Error('HTTP '+response.status);
  const html=await response.text();
  const blog=graph(html).find(x=>x['@type']==='BlogPosting');
  if(!blog || blog.author?.name!=='DeadPixelTest' ||
      blog.dateModified!=='2026-11-09' || !blog.datePublished ||
      !html.includes('Reviewed <time datetime="2026-11-09">November 9, 2026</time>'))
    failures.push('Blog editorial schema/content mismatch '+slug);
 }catch(error){failures.push('Blog provenance check '+slug+': '+String(error))}
}
if(failures.length){
  for(const problem of failures)console.error('FAIL '+problem);
  process.exit(1);
}
console.log('PASS live GEO content: 15 core pages, 3 articles and About verified for visible answers, author/date consistency, real GitHub project, sources and accessible branding.');
