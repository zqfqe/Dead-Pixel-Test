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
  if(options.interact)await options.interact(page);
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

 const scenarioChecks=[
  ['/tools/keyboard',async page=>{
   await page.getByRole('heading',{name:'Keyboard Tester'}).waitFor();
   const tkl=page.getByRole('button',{name:'TKL',exact:true});
   await tkl.click();
   if(!((await tkl.getAttribute('class'))||'').includes('bg-neutral-700'))throw Error('TKL layout did not activate');
   const sixty=page.getByRole('button',{name:'60%',exact:true});
   await sixty.click();
   if(!((await sixty.getAttribute('class'))||'').includes('bg-neutral-700'))throw Error('60-percent layout did not activate');
   await page.keyboard.press('a');
   const full=page.getByRole('button',{name:'Full',exact:true});
   await full.focus();
   await page.keyboard.press('Tab');
   if(await full.evaluate(el=>el===document.activeElement))throw Error('Keyboard tester blocked native Tab navigation');
   await page.keyboard.press('Control+k');
   await page.getByRole('dialog',{name:'Search tools'}).waitFor();
   await page.keyboard.press('Escape');
   await full.click();
   await page.getByRole('button',{name:'Reset All'}).click();
  }],
  ['/tools/double-click-test',async page=>{
   await page.getByRole('region',{name:'Mouse click test pad'}).click();
   await page.getByText('SINGLE CLICK',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Reset',exact:true}).click();
   await page.getByText('Click here to test',{exact:true}).waitFor();
  }],
  ['/tools/ppi-calculator',async page=>{
   const fields=page.locator('main#main-content input[type="number"]');
   if(await fields.count()!==3)throw Error('PPI calculator is missing its native resolution/diagonal inputs');
   await fields.nth(0).fill('1920');await fields.nth(1).fill('1080');await fields.nth(2).fill('24');
   await page.getByText('91.79',{exact:false}).first().waitFor();
   await fields.nth(0).fill('-120');
   await page.getByText(/Enter whole-number native pixel dimensions from 1 to 20,000/).waitFor();
   await fields.nth(0).fill('1920');
   await fields.nth(2).fill('0');
   await page.getByText(/Enter whole-number native pixel dimensions from 1 to 20,000/).waitFor();
   await fields.nth(2).fill('24');
   await page.getByText('91.79',{exact:false}).first().waitFor();
  }],
  ['/tools/mouse-polling',async page=>{
   await page.getByRole('heading',{name:'Mouse Polling Rate'}).waitFor();
   const avg=page.getByTestId('mouse-polling-average');
   await page.getByTestId('mouse-polling-surface').waitFor();
   await page.evaluate(()=>{
     const target=document.querySelector('[data-testid="mouse-polling-surface"]');
     const base=performance.now()+50;
     for(let i=0;i<135;i++){
       const event=new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse'});
       Object.defineProperty(event,'timeStamp',{value:base+i*10});
       target.dispatchEvent(event);
     }
     window.__fixtureTime=base+1340;
   });
   await page.waitForFunction(()=>document.querySelector('[data-testid="mouse-polling-average"]')?.textContent?.trim()==='100',null,{timeout:8000});
   await page.evaluate(()=>{
     const target=document.querySelector('[data-testid="mouse-polling-surface"]');
     for(let i=1;i<=155;i++){
       const event=new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse'});
       Object.defineProperty(event,'timeStamp',{value:window.__fixtureTime+i*4});
       target.dispatchEvent(event);
     }
   });
   await page.waitForFunction(()=>document.querySelector('[data-testid="mouse-polling-average"]')?.textContent?.trim()==='250',null,{timeout:8000});
   await page.getByRole('button',{name:'Reset Statistics'}).click();
   await page.waitForFunction(()=>document.querySelector('[data-testid="mouse-polling-average"]')?.textContent?.trim()==='0');
   await page.evaluate(()=>{
     for(let i=0;i<20;i++)document.body.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse'}));
   });
   await page.waitForTimeout(150);
   if(Number(await avg.textContent())!==0)throw Error('Outside-pad events were counted');
  }],
  ['/tools/reaction-time',async page=>{
   const audio=page.getByRole('button',{name:'Audio',exact:true});
   const visual=page.getByRole('button',{name:'Visual',exact:true});
   await audio.focus();
   await page.keyboard.press('Enter');
   if(!(await audio.getAttribute('class'))?.includes('bg-blue-600'))
    throw Error('Global reaction keyboard hotkey intercepted native Audio button activation');
   await visual.focus();
   await page.keyboard.press('Space');
   if(!(await visual.getAttribute('class'))?.includes('bg-blue-600'))
    throw Error('Global reaction keyboard hotkey intercepted native Visual button activation');
   await page.getByRole('heading',{level:1}).waitFor();
  }],
  ['/tools/input-lag',async page=>{
   const start=page.getByRole('button',{name:'Start Counter'});
   await start.click();
   const timer=page.getByTestId('input-lag-elapsed-ms');
   await timer.waitFor();
   await page.waitForTimeout(170);
   const value=Number(await timer.textContent());
   if(!(value>=35&&value<2000))throw Error('Timer is not session-relative: '+value);
   const frames=await page.getByTestId('input-lag-rendered-frames').textContent();
   const count=Number(frames?.split(':').at(-1)?.trim());
   if(!(count>=2))throw Error('No actual frame count: '+frames);
   const bg=await timer.evaluate(el=>getComputedStyle(el.closest('.fixed.inset-0')).backgroundColor);
   await page.keyboard.press('a');
   const flashed=await timer.evaluate(el=>getComputedStyle(el.closest('.fixed.inset-0')).backgroundColor);
   if(flashed===bg)throw Error('Keyboard input did not toggle the visible flash');
   await page.keyboard.press('Escape');
   await start.waitFor({timeout:12000});
   await start.click();
   await timer.waitFor();
   const restarted=Number(await timer.textContent());
   if(!(restarted>=0&&restarted<800))throw Error('Restart did not clear elapsed time: '+restarted);
   await page.keyboard.press('Escape');
   await start.waitFor();
  }],
  ['/tools/ruler',async page=>{
   await page.getByRole('heading',{name:'Physical Scale Calibration'}).waitFor();
   if(await page.getByText(/accurate to within 0\.5mm/).count())throw Error('Unverified ruler precision guarantee is still visible');
   await page.getByRole('button',{name:'Calibrate & Measure'}).click();
   await page.getByRole('heading',{name:'1:1 Physical Scale'}).waitFor();
   await page.getByRole('button',{name:'Recalibrate'}).click();
   await page.getByRole('heading',{name:'Physical Scale Calibration'}).waitFor();
  }]
 ];
 for(const [route,fn] of scenarioChecks)await inspectRoute(route,{interact:fn});
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS legacy coverage: '+routes.length+' routes, '+5+' mobile audits and 7 interactive functional checks (hardware behaviors not certified).');
