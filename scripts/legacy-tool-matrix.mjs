import {chromium} from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';

const base=process.env.SMOKE_BASE||'http://127.0.0.1:4321';
const canonicalOrigin=process.env.PUBLIC_SITE_URL?new URL(process.env.PUBLIC_SITE_URL).origin:'';
const source=readFileSync('data/menu.ts','utf8');
const routes=[...new Set([...source.matchAll(/path:\s*"(\/(?:tests|tools)\/[^"]+)"/g)].map(match=>match[1]))];
if(routes.length!==27)throw Error('Menu matrix expects all 27 existing tests/tools; found '+routes.length);
mkdirSync('smoke-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];

async function inspectRoute(path,options={}){
 const context=await browser.newContext({viewport:options.mobile?{width:390,height:844}:{width:1280,height:800}});
 const page=await context.newPage();
 const runtimeErrors=[],networkViolations=[];
 page.on('pageerror',error=>runtimeErrors.push(error.message));
 page.on('request',request=>{
  try{
   const u=new URL(request.url());
   if(['http:','https:'].includes(u.protocol)&&u.origin!==new URL(base).origin)
    networkViolations.push(request.url());
  }catch{}
 });
 try{
  const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:16000});
  if(response?.status()!==200)throw Error('Unexpected HTTP '+response?.status());
  await page.waitForFunction(path=>{
   const main=document.querySelector('main#main-content');
   if(!main||!main.textContent||main.textContent.trim().length<60)return false;
   // The gamepad tool intentionally displays a useful empty state without
   // a controller; unlike other tools it may not render any test controls.
   if(path==='/tools/controller'&&main.textContent.includes('No Controller Detected'))return true;
   return !!main.querySelector('button,input,select,canvas,video,[role="button"]');
  },path,{timeout:15000});
  if(canonicalOrigin){
   const href=await page.locator('link[rel="canonical"]').getAttribute('href');
   if(href!==canonicalOrigin+path)throw Error('Stale or missing Astro canonical: '+href);
  }
  const app=page.locator('main#main-content');
  if(!await app.count())throw Error('Astro page did not hydrate a legacy tool');
  if(options.mobile){
   const dimensions=await page.evaluate(()=>({viewport:window.innerWidth,page:document.documentElement.scrollWidth}));
   if(dimensions.page>dimensions.viewport+2)
    throw Error('Mobile horizontal overflow: '+JSON.stringify(dimensions));
  }
  await page.waitForTimeout(120);
  if(runtimeErrors.length)throw Error('Runtime exception: '+runtimeErrors.join('; '));
  if(networkViolations.length)throw Error('Unexpected third-party request: '+networkViolations.join('; '));
  console.log('PASS legacy route '+path+(options.mobile?' mobile':' desktop'));
 }catch(error){
  failures.push(path+(options.mobile?' mobile':'')+': '+String(error));
  console.error('FAIL legacy route '+path+': '+String(error));
  await page.screenshot({path:'smoke-screenshots/failure-legacy-'+path.replaceAll('/','_')+(options.mobile?'-mobile':'')+'.png',fullPage:true}).catch(()=>{});
 }finally{await context.close();}
}

try{
 for(const route of routes)await inspectRoute(route);
 for(const route of ['/tests/uniformity','/tools/keyboard','/tools/double-click-test','/tools/ppi-calculator','/tools/touch'])
  await inspectRoute(route,{mobile:true});
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS legacy coverage: '+routes.length+' routes loaded and '+5+' mobile overflow audits (hardware behaviors not certified).');
