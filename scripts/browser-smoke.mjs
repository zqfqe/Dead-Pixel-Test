import {chromium, devices} from 'playwright';
import {mkdirSync,readFileSync} from 'node:fs';
const base=process.env.SMOKE_BASE || 'http://127.0.0.1:4321';
const canonicalOrigin=process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL).origin : '';
const baseOrigin=new URL(base).origin;
mkdirSync('smoke-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
async function check(url,fn,{mobile=false,denyFullscreen=false,media=false,width}={}){
 const ctx=await browser.newContext(mobile?{...devices['iPhone 13'],browserName:undefined}:{viewport:{width:width||1366,height:900}});
 const page=await ctx.newPage();
 if(media)await page.addInitScript(()=>{
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;
  const ctx=canvas.getContext('2d');if(ctx){ctx.fillStyle='#2a7';ctx.fillRect(0,0,320,240);}
  const videoStream=canvas.captureStream(30);
  const audioContext=new AudioContext();
  const destination=audioContext.createMediaStreamDestination();
  const stream=new MediaStream([...videoStream.getVideoTracks(),...destination.stream.getAudioTracks()]);
  Object.defineProperty(window,'__smokeMediaStream',{value:stream,configurable:true});
  Object.defineProperty(window,'__smokeAudioContext',{value:audioContext,configurable:true});
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>stream});
 });
 const networkViolations=[];
 page.on('request',request=>{try{const u=new URL(request.url());if((u.protocol==='http:'||u.protocol==='https:')&&(u.origin!==baseOrigin||!['GET','HEAD'].includes(request.method())))networkViolations.push(request.method()+' '+request.url());}catch{}});
 if(denyFullscreen)await page.addInitScript(()=>{Element.prototype.requestFullscreen=function(){return Promise.reject(new Error('fullscreen denied by smoke test'));};});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const res=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:15000});
  if(res?.status()!==200)throw Error('HTTP '+res?.status());
  await fn(page);
  await page.waitForTimeout(250);
  const remoteResources=await page.locator('script[src],iframe[src]').evaluateAll(nodes=>nodes.map(n=>n.src).filter(src=>src&&new URL(src,location.href).origin!==location.origin));
  if(remoteResources.length)throw Error('Third-party script/frame resources: '+remoteResources.join(', '));
  if(networkViolations.length)throw Error('Privacy network audit: '+networkViolations.join('; '));
  if(errors.length)throw Error('JS errors: '+errors.join('; '));
  console.log('PASS browser: '+url+(mobile?' mobile':' desktop'));
 }catch(e){
  failures.push(url+': '+e.message);console.error('FAIL browser '+url+': '+e.message);
  await page.screenshot({path:'smoke-screenshots/failure-'+url.replaceAll('/','_').replace(/[^a-z0-9_-]/gi,'')+'.png',fullPage:true}).catch(()=>{});
 }finally{await ctx.close();}
}
const expectedTitle=(needle)=>async page=>{
 await page.waitForTimeout(450);
 const title=await page.title();
 if(!title.toLowerCase().includes(needle.toLowerCase()))throw Error('Title '+title);
 const canonicalLinks=page.locator('link[rel="canonical"]');
 const count=await canonicalLinks.count();
 if(count!==1)throw Error('Expected exactly one canonical; got '+count);
 const canon=await canonicalLinks.first().getAttribute('href');
 if(canonicalOrigin && !canon?.startsWith(canonicalOrigin+'/'))throw Error('Canonical '+canon);
 if(!canonicalOrigin && count!==0)throw Error('Domainless build must not emit a canonical');
};
await check('/',async page=>{
 await expectedTitle('Dead Pixel Test')(page);
 await page.getByRole('button',{name:/Start full-screen inspection/i}).waitFor({timeout:12000});
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByRole('dialog',{name:/Screen inspection/}).waitFor({timeout:12000});
 await page.getByRole('button',{name:/Mark suspect spot/i}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:140,y:220}});
 const count=await page.getByText(/Suspect spots: 1/).count();
 if(count===0)throw Error('Manual marking failed');
 await page.getByRole('button',{name:/Exit test/i}).click();
 await page.screenshot({path:'smoke-screenshots/home-desktop.png',fullPage:true});
});
await check('/pt-br',async page=>{
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).waitFor({timeout:12000});
 if(await page.locator('html').getAttribute('lang')!=='pt-BR')throw Error('Missing pt-BR language');
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).click();
 await page.getByRole('button',{name:/Sair do teste/i}).click();
},{mobile:true});
await check('/laptop-screen-dead-pixel-test',expectedTitle('Laptop Dead Pixel Test'));
await check('/pt-br/pixel-morto-notebook',expectedTitle('Pixel Morto'));
await check('/tests/refresh-rate',async page=>{
 await expectedTitle('Frame Skipping')(page);
 await page.getByText(/Refresh Rate|Frame Skipping/i).first().waitFor({timeout:15000});
});
await check('/tests/local-dimming',async page=>{
 await expectedTitle('Local Dimming')(page);
 await page.getByText(/Local Dimming/i).first().waitFor({timeout:15000});
});
await check('/tests/color-gradient',expectedTitle('Color Banding'));
await check('/image-retention-test',async page=>{
 await expectedTitle('Image Retention')(page);
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByText('Gray (1/8)',{exact:true}).waitFor({timeout:8000});
 await page.getByRole('button',{name:/Next color/i}).click();
 await page.getByText('Near black (2/8)',{exact:true}).waitFor({timeout:5000});
 await page.getByRole('button',{name:/Exit test/i}).click();
});
await check('/dead-pixel-line-test',async page=>{
 await expectedTitle('Dead Pixel Line Test')(page);
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByText('Black (1/10)',{exact:true}).waitFor({timeout:8000});
 const next=page.getByRole('button',{name:/Next color/i});
 for(let i=0;i<5;i++)await next.click();
 await page.getByText('Horizontal (6/10)',{exact:true}).waitFor({timeout:5000});
 await next.click();
 await page.getByText('Vertical (7/10)',{exact:true}).waitFor({timeout:5000});
 await next.click();
 await page.getByText('Horizontal fine (8/10)',{exact:true}).waitFor({timeout:5000});
 await next.click();
 await page.getByText('Vertical fine (9/10)',{exact:true}).waitFor({timeout:5000});
 await next.click();
 await page.getByText('Grid (10/10)',{exact:true}).waitFor({timeout:5000});
 const gridCss=await page.locator('[role="dialog"] [role="presentation"]').evaluate(el=>getComputedStyle(el).backgroundImage);
 if(gridCss.match(/repeating-linear-gradient/g)?.length!==2||!/(transparent|rgba\(0,\s*0,\s*0,\s*0\))/.test(gridCss))throw Error('Grid pattern lacks independent horizontal and vertical transparent layers: '+gridCss);
 await page.getByRole('button',{name:/Exit test/i}).click();
});
await check('/privacy-policy',async page=>{
 await page.getByRole('heading',{name:'Privacy Policy'}).waitFor({timeout:10000});
 await page.getByText(/does not include Google Analytics, advertising tags/i).waitFor();
 await page.getByText(/browser's local storage/i).waitFor();
});
await check('/contact',async page=>{
 await page.getByRole('heading',{name:/Contact & Feedback/i}).waitFor({timeout:10000});
 await page.getByRole('link',{name:/Open GitHub Issues/i}).waitFor();
});
await check('/screen-resolution-test',async page=>{
 await expectedTitle('Screen Resolution')(page);
 for(const label of ['Screen width (CSS px)','Available screen height (CSS px)','Browser viewport width (CSS px)','Visual viewport width (CSS px)','Device pixel ratio (DPR)','Screen color depth (bits)','Orientation']){
  await page.getByText(label,{exact:true}).waitFor({timeout:8000});
 }
});
await check('/',async page=>{
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByText(/Native fullscreen was denied or unavailable/i).waitFor({timeout:5000});
 await page.getByRole('button',{name:/Exit test/i}).click();
},{denyFullscreen:true});
await check('/phone-screen-dead-pixel-test',async page=>{
 await expectedTitle('Phone Screen Dead Pixel Test')(page);
 const width=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 if(width.documentWidth>width.viewport+2)throw Error('Mobile landing page horizontally overflows: '+JSON.stringify(width));
 await page.getByRole('button',{name:/Start full-screen inspection/i}).tap();
 await page.getByRole('dialog',{name:/Screen inspection/i}).waitFor();
 await page.getByRole('button',{name:/Next color/i}).tap();
 await page.getByText('White (2/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Exit test/i}).tap();
},{mobile:true,denyFullscreen:true});
await check('/dead-pixel-line-test',async page=>{
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByRole('dialog',{name:/Screen inspection/i}).waitFor();
 await page.keyboard.press('ArrowRight');
 await page.getByText('White (2/10)',{exact:true}).waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('dialog',{name:/Screen inspection/i}).waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.activeElement?.textContent?.includes('Start full-screen inspection'),null,{timeout:5000});
});
await check('/',async page=>{
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByRole('button',{name:/Mark suspect spot/i}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:200,y:180}});
 await page.getByRole('button',{name:/Exit test/i}).click();
 await page.getByRole('combobox',{name:/Observation/i}).first().selectOption('stuck-color');
 await page.getByRole('textbox',{name:/Notes/i}).first().fill('Visible only on red and white');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:/Export self-check JSON/i}).click();
 const download=await downloadPromise;
 const body=readFileSync(await download.path(),'utf8');
 const payload=JSON.parse(body);
 if(payload.kind!=='user_observed_screen_inspection'||payload.certified!==false)throw Error('Report misrepresents certification');
 if(payload.marks?.length!==1||payload.marks[0].notes!=='Visible only on red and white'||payload.marks[0].category!=='stuck-color')throw Error('Exported marker data incorrect');
 if(!(payload.marks[0].xRatio>=0&&payload.marks[0].xRatio<=1))throw Error('Invalid marker coordinate');
});
await check('/tools/webcam',async page=>{
 await page.getByRole('button',{name:/Start Camera/i}).first().click();
 await page.waitForFunction(()=>{const video=document.querySelector('video');return !!video&&video.videoWidth===320&&video.videoHeight===240;},null,{timeout:10000});
 await page.getByText('320 × 240',{exact:true}).waitFor({timeout:5000});
 const downloadPromise=page.waitForEvent('download',{timeout:10000});
 await page.getByRole('button',{name:/Take Snapshot/i}).click();
 const download=await downloadPromise;
 if(!download.suggestedFilename().startsWith('webcam-test-'))throw Error('Webcam snapshot was not a local download');
 await page.getByRole('button',{name:/Stop Camera/i}).click();
 await page.getByRole('button',{name:/Start Camera/i}).first().waitFor({timeout:5000});
 const tracksEnded=await page.evaluate(()=>window.__smokeMediaStream.getTracks().every(track=>track.readyState==='ended'));
 if(!tracksEnded)throw Error('Media tracks were not stopped');
 await page.evaluate(()=>window.__smokeAudioContext.close());
},{media:true});
await check('/tools/color-blindness',async page=>{
 await page.getByRole('button',{name:/Use Camera/i}).click();
 await page.waitForFunction(()=>{
  const video=document.querySelector('video');
  return video&&video.videoWidth===320&&video.videoHeight===240;
 },null,{timeout:10000});
 await page.getByRole('button',{name:/Change Source/i}).click();
 await page.getByRole('button',{name:/Use Camera/i}).waitFor({timeout:5000});
 const stopped=await page.evaluate(()=>window.__smokeMediaStream.getTracks().every(t=>t.readyState==='ended'));
 if(!stopped)throw Error('Color vision camera did not stop tracks');
 await page.evaluate(()=>window.__smokeAudioContext.close());
},{media:true});
await check('/tools/color-blindness',async page=>{
 await page.getByRole('button',{name:/Use Camera/i}).waitFor({timeout:10000});
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#e34b4b"/></svg>';
 await page.locator('input[type="file"]').setInputFiles({name:'local-test.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
 const img=page.locator('img[alt="Test"]');
 await img.waitFor({timeout:8000});
 await page.waitForFunction(()=>{const image=document.querySelector('img[alt="Test"]');return !!image&&image.complete&&image.naturalWidth===32;},null,{timeout:8000});
 const src=await img.getAttribute('src');
 if(!src?.startsWith('blob:'))throw Error('Selected image was not loaded from a local object URL');
});
await check('/',async page=>{
 const skip=page.getByRole('link',{name:/Skip to main content/i});
 await page.keyboard.press('Tab');
 if(!await skip.evaluate(el=>el===document.activeElement))throw Error('Skip link is not the first keyboard focus target');
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>location.hash==='#main-content');
 if(!await page.locator('main#main-content').count())throw Error('Skip target missing');
 await page.emulateMedia({reducedMotion:'reduce'});
 const duration=await page.locator('a.skip-link').evaluate(el=>getComputedStyle(el).transitionDuration);
 if(duration==='0s' || duration==='0.01ms')return;
 const seconds=duration.split(',').map(s=>parseFloat(s));
 if(seconds.some(s=>s>0.01))throw Error('Reduced-motion transition remains active: '+duration);
});
await check('/tests/refresh-rate',async page=>{
 const skip=page.getByRole('link',{name:/Skip to main content/i});
 await skip.waitFor({timeout:10000});
 await skip.focus();
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>location.hash==='#main-content');
 if(!await page.locator('main#main-content').count())throw Error('Legacy skip target missing');
});
await check('/tests/refresh-rate',async page=>{
 const toggle=page.locator('button[aria-controls="mobile-site-menu"]');
 await toggle.waitFor({timeout:10000});
 const menu=page.locator('#mobile-site-menu');
 if(await toggle.getAttribute('aria-expanded')!=='false')throw Error('Mobile menu open by default');
 await toggle.click();
 if(await toggle.getAttribute('aria-expanded')!=='true')throw Error('Mobile menu toggle state mismatch');
 await menu.getByRole('link',{name:'Refresh Rate / Skipping'}).waitFor();
 await page.keyboard.press('Escape');
 if(await toggle.getAttribute('aria-expanded')!=='false')throw Error('Mobile menu did not close with Escape');
 if(await menu.getAttribute('aria-hidden')!=='true')throw Error('Closed mobile menu remains exposed to accessibility tree');
},{mobile:true});
await check('/phone-screen-dead-pixel-test',async page=>{
 await page.getByRole('button',{name:/Start full-screen inspection/i}).tap();
 await page.getByText('Black (1/8)',{exact:true}).waitFor();
 await page.locator('[role="dialog"] [role="presentation"]').evaluate(stage=>{
   const x=window.innerWidth-40,y=window.innerHeight/2;
   const from=new Touch({identifier:1,target:stage,clientX:x,clientY:y});
   const to=new Touch({identifier:1,target:stage,clientX:40,clientY:y});
   stage.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[from],targetTouches:[from],changedTouches:[from]}));
   stage.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[to]}));
 });
 await page.getByText('White (2/8)',{exact:true}).waitFor({timeout:5000});
 await page.getByRole('button',{name:'Jump to Yellow'}).click();
 await page.getByText('Yellow (8/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Exit test/i}).click();
},{mobile:true,denyFullscreen:true});
await check('/pt-br',async page=>{
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).tap();
 await page.getByText('Preto (1/8)',{exact:true}).waitFor({timeout:5000});
 await page.getByRole('button',{name:'Ir para Amarelo'}).click();
 await page.getByText('Amarelo (8/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Sair do teste/i}).click();
},{mobile:true,denyFullscreen:true});
await check('/what-is-a-dead-pixel',async page=>{
 await page.getByRole('heading',{name:'Compare what you see'}).waitFor();
 await page.getByRole('heading',{name:'Dark spot on a bright background'}).waitFor();
 const href=await page.getByRole('link',{name:'Português (Brasil)'}).getAttribute('href');
 if(href!=='/pt-br/o-que-e-dead-pixel')throw Error('Guide locale counterpart is incorrect: '+href);
});
await check('/pt-br/o-que-e-dead-pixel',async page=>{
 await page.getByRole('heading',{name:'Compare o que você observa'}).waitFor();
 await page.getByRole('heading',{name:'Faixa horizontal ou vertical'}).waitFor();
 const href=await page.getByRole('link',{name:'English'}).getAttribute('href');
 if(href!=='/what-is-a-dead-pixel')throw Error('pt-BR locale counterpart is incorrect: '+href);
});
await check('/screen-resolution-test',async page=>{
 await page.getByRole('button',{name:'Copy browser metrics'}).click();
 await page.waitForFunction(()=>{
   const text=document.querySelector('#copy-screen-status')?.textContent??'';
   return text.includes('copied')||text.includes('unavailable');
 },null,{timeout:5000});
});
await check('/dead-pixel-fixer',async page=>{
 await page.getByRole('heading',{name:'How to use the static color patch'}).waitFor();
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 const zone=page.locator('[role="dialog"] [role="presentation"]');
 await zone.click({position:{x:250,y:280}});
 const picker=page.getByLabel('Static patch color');
 await picker.fill('#00ff00');
 const patch=zone.locator('div[aria-hidden="true"]').first();
 const style=await patch.getAttribute('style');
 if(!style?.includes('rgb(0, 255, 0)')&&!style?.includes('#00ff00'))throw Error('Static patch color did not update: '+style);
 await page.getByRole('button',{name:/Exit test/i}).click();
});
await check('/',async page=>{
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByRole('button',{name:/Mark suspect spot/i}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:240,y:250}});
 await page.getByRole('button',{name:/Exit test/i}).click();
 await page.getByRole('textbox',{name:/Notes/i}).first().fill('<img src=x onerror=alert(1)>');
 const downloadPromise=page.waitForEvent('download',{timeout:10000});
 await page.getByRole('button',{name:/Download printable HTML report/i}).click();
 const file=await downloadPromise;
 const html=readFileSync(await file.path(),'utf8');
 if(!html.includes('&lt;img src=x onerror=alert(1)&gt;'))throw Error('Printable HTML did not escape user notes');
 if(html.includes('window.onload=()=>window.print()'))throw Error('Printable report unexpectedly auto-prints');
 if(!html.includes('window.print()'))throw Error('Printable report has no explicit print control');
});
await check('/',async page=>{
 await page.getByText(/Clean the glass gently and check whether dust/i).waitFor();
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByRole('button',{name:'Hide controls'}).click();
 if(await page.getByRole('button',{name:'Next color'}).count())throw Error('Bottom control bar is visible in minimal mode');
 await page.getByRole('button',{name:'Show controls'}).click();
 await page.getByRole('button',{name:'Next color'}).click();
 await page.getByText('White (2/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Mark suspect spot'}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:200,y:210}});
 await page.getByRole('button',{name:/Exit test/i}).click();
 await page.getByRole('combobox',{name:/Observation/i}).first().selectOption('dust-or-surface');
 const [d]=await Promise.all([
   page.waitForEvent('download'),
   page.getByRole('button',{name:/Export self-check JSON/i}).click()
 ]);
 const json=JSON.parse(readFileSync(await d.path(),'utf8'));
 if(json.observedCount!==2||json.totalPatterns!==8||json.marks[0]?.category!=='dust-or-surface')
  throw Error('Visit progress or dust category export inaccurate');
 await page.getByRole('button',{name:'New empty session'}).click();
 if(await page.getByText(/Suspect spots: 1/).count())throw Error('New session did not clear marks');
 if(await page.getByRole('button',{name:/Export self-check JSON/i}).count())throw Error('New session retained previous export');
});
await check('/screen-resolution-test',async page=>{
 await page.getByLabel('Native width (physical pixels)').fill('1920');
 await page.getByLabel('Native height (physical pixels)').fill('1080');
 await page.getByLabel('Screen diagonal (inches)').fill('24');
 await page.getByRole('button',{name:'Calculate PPI'}).click();
 await page.getByText(/Confirm the native physical pixel resolution/i).last().waitFor();
 await page.getByRole('checkbox',{name:/I checked the native physical resolution/i}).check();
 await page.getByRole('button',{name:'Calculate PPI'}).click();
 await page.getByText(/91\.79 PPI/).waitFor();
 await page.getByLabel('Native width (physical pixels)').fill('-5');
 await page.getByRole('button',{name:'Calculate PPI'}).click();
 await page.getByText(/Enter positive native pixel dimensions/i).waitFor();
});
await check('/screen-contrast-test',async page=>{
 await page.getByRole('heading',{name:'Read the 14 contrast and color patterns'}).waitFor();
 await page.getByRole('button',{name:/Start full-screen inspection/i}).click();
 await page.getByText('Black (1/14)',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Jump to Red gradient'}).click();
 await page.getByText('Red gradient (8/14)',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Jump to Color bars'}).click();
 await page.getByText('Color bars (11/14)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Exit test/i}).click();
});
await check('/pt-br/teste-de-cores',async page=>{
 await page.getByRole('heading',{name:'Como interpretar os 14 padrões de cores e contraste'}).waitFor();
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).click();
 await page.getByRole('button',{name:'Ir para Gradiente azul'}).click();
 await page.getByText('Gradiente azul (10/14)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Sair do teste/i}).click();
});
await check('/laptop-screen-dead-pixel-test',async page=>{
 await page.getByRole('heading',{name:'Laptop-specific troubleshooting before requesting repair'}).waitFor();
 await page.getByRole('heading',{name:'Internal panel versus external monitor'}).waitFor();
 await page.getByRole('heading',{name:'Angle and power changes'}).waitFor();
});
await check('/pt-br/pixel-morto-iphone',async page=>{
 await page.getByRole('heading',{name:'Verificações específicas para iPhone e celular'}).waitFor();
 await page.getByRole('heading',{name:'Safari e tela cheia'}).waitFor();
});
await check('/image-retention-test',async page=>{
 await page.getByRole('heading',{name:'Temporary retention and permanent OLED burn-in are not interchangeable'}).waitFor();
 await page.getByRole('heading',{name:'Neutral gray first'}).waitFor();
});
await check('/',async page=>{
 const body=await page.evaluate(()=>({surface:document.body.dataset.surface,bg:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.body).color}));
 if(body.surface!=='light'||body.bg!=='rgb(246, 248, 251)'||body.ink!=='rgb(16, 24, 39)')throw Error('Information page does not use light palette: '+JSON.stringify(body));
 const extent=await page.evaluate(()=>({body:document.body.getBoundingClientRect().height,document:document.documentElement.scrollHeight}));
 if(extent.body<extent.document-5)throw Error('Light page body ends before full page content, exposing dark root: '+JSON.stringify(extent));
 const workspace=page.getByText('Start your screen check',{exact:true}).locator('..');
 const bg=await workspace.evaluate(el=>getComputedStyle(el).backgroundColor);
 if(bg!=='rgb(10, 11, 14)')throw Error('Immersive workspace is not dark: '+bg);
 await page.screenshot({path:'smoke-screenshots/site-home-desktop.png',fullPage:true});
});
await check('/pt-br',async page=>{
 const bg=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
 if(bg!=='rgb(246, 248, 251)')throw Error('Brazilian information page is not light');
 const extent=await page.evaluate(()=>({body:document.body.getBoundingClientRect().height,document:document.documentElement.scrollHeight}));
 if(extent.body<extent.document-5)throw Error('Brazilian page body ends before content: '+JSON.stringify(extent));
 await page.screenshot({path:'smoke-screenshots/site-pt-br-mobile.png',fullPage:true});
},{mobile:true});
await check('/tests/refresh-rate',async page=>{
 const value=await page.evaluate(()=>document.body.dataset.surface);
 if(value!=='dark')throw Error('Legacy tool lost dark theme');
});
await check('/',async page=>{
 const sizes=await page.evaluate(()=>({screen:innerWidth,root:document.documentElement.scrollWidth}));
 if(sizes.root>sizes.screen+2)throw Error('Homepage overflows 360px width '+JSON.stringify(sizes));
 await page.screenshot({path:'smoke-screenshots/site-home-360.png',fullPage:true});
},{width:360});
await check('/screen-contrast-test',async page=>{
 const sizes=await page.evaluate(()=>({screen:innerWidth,root:document.documentElement.scrollWidth}));
 if(sizes.root>sizes.screen+2)throw Error('Contrast landing page overflows 360px width '+JSON.stringify(sizes));
 await page.screenshot({path:'smoke-screenshots/site-contrast-360.png',fullPage:true});
},{width:360});
await check('/pt-br/pixel-morto-notebook',async page=>{
 const sizes=await page.evaluate(()=>({screen:innerWidth,root:document.documentElement.scrollWidth}));
 if(sizes.root>sizes.screen+2)throw Error('Notebook landing page overflows 768px width '+JSON.stringify(sizes));
},{width:768});
{
 const ctx=await browser.newContext();
 const page=await ctx.newPage();
 try{
  const response=await page.goto(base+'/this-path-is-not-a-real-test-987654321',{waitUntil:'domcontentloaded'});
  if(response?.status()!==404)throw Error('Unknown URLs must return real HTTP 404, got '+response?.status());
  await page.getByRole('heading',{name:'Page not found'}).waitFor();
  const robots=await page.locator('meta[name="robots"]').getAttribute('content');
  if(!robots?.includes('noindex'))throw Error('404 page unexpectedly indexable');
  if(!await page.locator('main#main-content').count())throw Error('404 page has no keyboard skip target');
  console.log('PASS browser: real HTTP 404 with noindex');
 }catch(error){
  failures.push('404: '+error.message);console.error('FAIL browser 404: '+error.message);
 }finally{await ctx.close();}
}
await check('/',async page=>{
 await page.getByRole('button',{name:'Start full-screen inspection'}).click();
 await page.getByRole('button',{name:'Mark suspect spot'}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:190,y:230}});
 await page.getByRole('button',{name:'Next color'}).click();
 await page.getByText('White (2/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Not visible on this color'}).click();
 await page.getByRole('button',{name:'Next color'}).click();
 await page.getByText('Red (3/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Still visible on this color'}).click();
 await page.getByRole('button',{name:/Exit test/}).click();
 const d=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export self-check JSON'}).click();
 const report=JSON.parse(readFileSync(await (await d).path(),'utf8'));
 const spot=report.marks?.[0];
 if(JSON.stringify(spot?.observedOn)!==JSON.stringify(['Black','Red'])||
    JSON.stringify(spot?.notObservedOn)!==JSON.stringify(['White']))
   throw Error('Recheck verdicts were not serialized correctly: '+JSON.stringify(spot));
 if(report.certified!==false)throw Error('Recheck report incorrectly certified');
 const htmlDownload=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download printable HTML report'}).click();
 const html=readFileSync(await (await htmlDownload).path(),'utf8');
 if(!html.includes('Not visible on')||!html.includes('White')||!html.includes('Red'))
   throw Error('Printable report omitted cross-color observed/absent evidence');
});
await check('/pt-br',async page=>{
 await page.getByRole('button',{name:'Iniciar inspeção em tela cheia'}).click();
 await page.getByRole('button',{name:'Marcar ponto suspeito'}).click();
 await page.locator('[role="dialog"] [role="presentation"]').click({position:{x:195,y:205}});
 await page.getByRole('button',{name:'Próxima cor'}).click();
 await page.getByRole('button',{name:'Não visível nesta cor'}).click();
 await page.getByRole('button',{name:'Limpar confirmação desta cor'}).click();
 await page.getByRole('button',{name:'Ainda visível nesta cor'}).click();
 await page.getByRole('button',{name:/Sair do teste/}).click();
 const d=page.waitForEvent('download');
 await page.getByRole('button',{name:'Exportar inspeção JSON'}).click();
 const item=JSON.parse(readFileSync(await (await d).path(),'utf8')).marks?.[0];
 if(!item?.observedOn?.includes('White')||item?.notObservedOn?.includes('White'))
   throw Error('Portuguese repeated rechecks did not keep a single consistent status');
});
await check('/',async page=>{
 const prior={
  kind:'user_observed_screen_inspection',certified:false,
  createdAt:'2026-11-01T08:00:00.000Z',deviceType:'laptop',
  observedPatterns:['Black','White'],marks:[{
   xRatio:0.3,yRatio:0.4,observedOn:['Black'],notObservedOn:['White'],
   category:'dust-or-surface',notes:'dust versus subpixel',
   viewportAtMark:{width:1366,height:900,dpr:1,orientation:'landscape'}
  }]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'previous-check.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(prior))
 });
 await page.getByText('Previous self-check loaded locally. Review each marked spot before continuing.').waitFor();
 await page.getByText('Suspect spots: 1').waitFor();
 const category=await page.getByRole('combobox',{name:'Observation'}).first().inputValue();
 if(category!=='dust-or-surface')throw Error('Imported classification was lost');
 await page.getByRole('button',{name:'Start full-screen inspection'}).click();
 await page.getByRole('button',{name:'Next color'}).click();
 await page.getByRole('button',{name:'Still visible on this color'}).click();
 await page.getByRole('button',{name:'Exit test'}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export self-check JSON'}).click();
 const data=JSON.parse(readFileSync(await (await download).path(),'utf8'));
 const mark=data.marks[0];
 if(data.createdAt!==prior.createdAt||data.deviceType!=='laptop'||
    !mark.observedOn.includes('White')||mark.notObservedOn.includes('White')){
   throw Error('Imported self-check data or recheck update invalid: '+JSON.stringify(data));
 }
});
await check('/',async page=>{
 const invalid={
  kind:'user_observed_screen_inspection',certified:false,
  marks:[{xRatio:1.5,yRatio:0.3,observedOn:['Black'],notObservedOn:[],
   category:'dark',notes:'Invalid',viewportAtMark:{width:100,height:100,dpr:1,orientation:'portrait'}}]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'invalid-check.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))
 });
 await page.getByText(/not a valid self-check report/i).waitFor();
 if(await page.getByRole('button',{name:'Export self-check JSON'}).count())throw Error('Invalid report entered a saved test session');
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS all '+47+' Chromium browser scenarios, including safe local JSON restore and recheck evidence');
