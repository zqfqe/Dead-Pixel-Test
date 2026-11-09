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
  if(options.beforeNavigate)await options.beforeNavigate(page);
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
  ['/tools/touch',async page=>{
   await page.getByRole('button',{name:'Start Touch Test'}).click();
   const canvas=page.getByTestId('touch-test-canvas'),count=page.getByTestId('touch-active-count');
   await canvas.waitFor();
   await page.evaluate(()=>{
     const el=document.querySelector('[data-testid="touch-test-canvas"]');
     const a=new Touch({identifier:1,target:el,clientX:80,clientY:120,force:0});
     const b=new Touch({identifier:2,target:el,clientX:140,clientY:190,force:0.7});
     el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[a,b],targetTouches:[a,b],changedTouches:[a,b]}));
   });
   await count.getByText('Points: 2').waitFor();
   await page.getByText('F:0.00').waitFor();
   const blocked=await page.evaluate(()=>{
     const e=new TouchEvent('touchmove',{bubbles:true,cancelable:true});
     document.body.dispatchEvent(e);return e.defaultPrevented;
   });
   if(blocked)throw Error('Touch tester blocks touch interactions on the entire body');
   await page.evaluate(()=>{
     const el=document.querySelector('[data-testid="touch-test-canvas"]');
     el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[]}));
   });
   await page.getByText('Points: 0').waitFor();
   await page.getByRole('button',{name:'Clear'}).click();
   await page.getByRole('button',{name:'Exit'}).click();
   await page.getByRole('button',{name:'Start Touch Test'}).waitFor();
  }],
  ['/tools/color-blindness',async page=>{
   const file=page.locator('input[type="file"]');
   await file.setInputFiles({name:'unsafe.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')});
   await page.getByText(/Choose a PNG, JPEG, WebP, GIF or AVIF/).waitFor();
   const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WDCoQAAAABJRU5ErkJggg==','base64');
   await file.setInputFiles({name:'tiny.png',mimeType:'image/png',buffer:pixel});
   const layer=page.getByTestId('cvd-filtered-layer');
   await layer.waitFor();
   const mode=page.getByRole('button',{name:'Protanopia (Red-Blind)'});
   await mode.click();
   if(!(await layer.getAttribute('style'))?.includes('#protanopia'))throw Error('Selected color filter was not applied');
   if((await mode.getAttribute('aria-pressed'))!=='true')throw Error('Filter mode aria-pressed incorrect');
   await page.getByRole('button',{name:'Change Source'}).click();
   await page.getByText('Upload Image').waitFor();
  }],
  ['/tools/webcam',async page=>{
   await page.getByRole('button',{name:'Start Camera'}).first().click();
   await page.locator('video').waitFor();
   await page.getByText(/Microphone unavailable or permission denied/).waitFor();
   await page.getByRole('button',{name:'Stop Camera'}).click();
   await page.getByText('Camera is off').waitFor();
   if(await page.evaluate(()=>window.__fakeCameraTrack?.readyState)!=='ended')
     throw Error('Camera video track not released on Stop');
  }],
  ['/tools/double-click-test',async page=>{
   const pad=page.getByRole('region',{name:'Mouse click test pad'});
   await pad.click();
   await page.getByText('SINGLE CLICK',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Reset',exact:true}).click();
   await page.getByText('Click here to test',{exact:true}).waitFor();
   await page.evaluate(()=>{
     const target=document.querySelector('[data-testid="double-click-pad"]');
     for(const stamp of [1500,1530,1700]){
       const event=new MouseEvent('mousedown',{bubbles:true,button:0});
       Object.defineProperty(event,'timeStamp',{value:stamp});
       target.dispatchEvent(event);
     }
   });
   await page.waitForFunction(()=>document.querySelector('[data-testid="click-count"]')?.textContent==='3');
   if((await page.getByTestId('rapid-click-count').textContent())!=='1')
     throw Error('Expected exactly one rapid repeat at 30ms');
   if(!/^\d{2}:\d{2}/.test((await page.getByTestId('click-event-clock').first().textContent())?.trim()||''))
     throw Error('Missing real wall-clock log timestamp');
   const allowed=await page.evaluate(()=>{
     const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});
     document.body.dispatchEvent(e);return !e.defaultPrevented;
   });
   if(!allowed)throw Error('Outside test pad right-click was intercepted');
   await page.getByRole('button',{name:'Reset',exact:true}).click();
   if((await page.getByTestId('rapid-click-count').textContent())!=='0')
     throw Error('Reset did not clear rapid repeat counter');
  }],
  ['/tools/speaker-test',async page=>{
   await page.getByRole('heading',{level:1,name:'Audio System Test'}).waitFor();
   const left=page.getByRole('button',{name:'LEFT',exact:true});
   await left.click();
   await page.getByRole('button',{name:'Polarity / Phase'}).click();
   await page.getByRole('button',{name:'IN PHASE (Center)'}).click();
   await page.getByRole('button',{name:'Stop Noise'}).waitFor();
   const inBtn=page.getByRole('button',{name:'IN PHASE (Center)'});
   const outBtn=page.getByRole('button',{name:'OUT OF PHASE (Wide)'});
   if(!(await inBtn.getAttribute('class'))?.includes('border-green-500'))throw Error('Selected in-phase state missing');
   if((await outBtn.getAttribute('class'))?.includes('border-red-500'))throw Error('Out-of-phase falsely selected');
   await outBtn.click();
   if(!(await outBtn.getAttribute('class'))?.includes('border-red-500'))throw Error('Out-of-phase button did not activate');
   await page.getByRole('button',{name:'Stop Noise'}).click();
   if(await page.getByRole('button',{name:'Stop Noise'}).count())throw Error('Phase test failed to stop');
   await page.getByRole('button',{name:'Frequency Sweep'}).click();
   await page.getByRole('button',{name:/Start 20Hz/}).click();
   await page.getByRole('button',{name:'Stop',exact:true}).waitFor();
   await page.getByRole('button',{name:'Stop',exact:true}).click();
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
   await page.getByRole('heading',{level:1,name:'Mouse Polling Rate',exact:true}).waitFor();
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
   await audio.focus();await page.keyboard.press('Enter');
   if(!(await audio.getAttribute('class'))?.includes('bg-blue-600'))throw Error('Native Audio button activation was intercepted');
   await visual.focus();await page.keyboard.press('Space');
   if(!(await visual.getAttribute('class'))?.includes('bg-blue-600'))throw Error('Native Visual button activation was intercepted');
   const pad=page.getByRole('button',{name:'Reaction test area'});
   await pad.focus();await page.keyboard.press('Space');
   await page.getByText('Wait for Green...').waitFor();
   await page.evaluate(()=>{
     Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});
     document.dispatchEvent(new Event('visibilitychange'));
   });
   await page.getByText('Visual Reflex').waitFor();
   await page.evaluate(()=>{
     Object.defineProperty(window,'AudioContext',{configurable:true,value:undefined});
     Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:undefined});
     Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});
   });
   await audio.click();await pad.focus();await page.keyboard.press('Enter');
   await page.getByRole('alert').getByText(/Audio playback is not available/).waitFor();
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
   if(await page.getByText(/accurate to within 0\.5mm/).count())throw Error('Unsupported precision guarantee');
   await page.setViewportSize({width:360,height:780});
   const card=page.getByTestId('ruler-reference-card');
   await page.waitForFunction(()=>{
     const ref=document.querySelector('[data-testid="ruler-reference-card"]');
     const area=document.querySelector('[data-testid="ruler-calibration-area"]');
     return ref&&area&&ref.getBoundingClientRect().width<=area.getBoundingClientRect().width-15;
   },null,{timeout:5000});
   const mobileWidth=(await card.boundingBox()).width;
   await page.setViewportSize({width:900,height:840});
   await page.waitForFunction(()=>document.querySelector('[data-testid="ruler-reference-card"]')?.getBoundingClientRect().width>300);
   if(!((await card.boundingBox()).width>mobileWidth))throw Error('Card preview did not respond to available width');
   await page.getByRole('button',{name:'Calibrate & Measure'}).click();
   await page.getByRole('heading',{name:'1:1 Physical Scale'}).waitFor();
   const countVertical=await page.getByTestId('ruler-vertical-ticks').locator(':scope > div').count();
   if(countVertical<5)throw Error('Vertical ruler ticks not rendered');
   const horizontal=await page.getByTestId('ruler-horizontal-ticks').locator(':scope > div').count();
   if(horizontal<5)throw Error('Horizontal ruler ticks missing');
   // A browser window cannot safely be resized by CI while its page is fullscreen.
   // Screen rotation during full-screen measurement requires real device validation.
   await page.getByRole('button',{name:'Recalibrate'}).click();
   await page.getByRole('heading',{name:'Physical Scale Calibration'}).waitFor();
  }]
 ];
 for(const [route,fn] of scenarioChecks)await inspectRoute(route,{
  interact:fn,
  beforeNavigate:route==='/tools/webcam'?async page=>await page.addInitScript(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=160;canvas.height=90;
    const stream=canvas.captureStream(1);
    window.__fakeCameraTrack=stream.getVideoTracks()[0];
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async constraints=>{
      if(constraints?.video)return stream;
      throw new DOMException('Microphone denied','NotAllowedError');
    }});
  }):undefined
 });
 await inspectRoute('/tools/controller',{
  beforeNavigate:async page=>await page.addInitScript(()=>{
   window.__mockPads=[null,{id:'QA Minimal Controller',index:1,connected:true,mapping:'standard',buttons:[{pressed:false,value:0}],axes:[],timestamp:0}];
   Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>window.__mockPads});
  }),
  interact:async page=>{
   await page.getByRole('heading',{level:1,name:/QA Minimal Controller/}).waitFor();
   if(await page.getByText(/NaN/).count())throw Error('Sparse controller generated NaN values');
   await page.evaluate(()=>{window.__mockPads=[null,null];});
   await page.getByRole('heading',{name:'No Controller Detected'}).waitFor();
   await page.evaluate(()=>{window.__mockPads=[{id:'QA Reconnected Pad',index:0,connected:true,mapping:'standard',buttons:[{pressed:false,value:0}],axes:[0,0],timestamp:0}];});
   await page.getByRole('heading',{level:1,name:/QA Reconnected Pad/}).waitFor();
  }
 });
}finally{await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS legacy coverage: '+routes.length+' routes, '+5+' mobile audits and 12 interactive functional checks (hardware behaviors not certified).');
