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
 const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4YWQDAAL8ATdGk8MjAAAAAElFTkSuQmCC','base64');
 await page.locator('input[type="file"]').setInputFiles({name:'local-test.png',mimeType:'image/png',buffer:pixel});
 const img=page.locator('img[alt="Uploaded source image with approximate color-vision filter"]');
 await img.waitFor({timeout:8000});
 await page.waitForFunction(()=>{
  const image=document.querySelector('img[alt="Uploaded source image with approximate color-vision filter"]');
  return !!image&&image.complete&&image.naturalWidth===1;
 },null,{timeout:8000});
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
 const href=await page.getByRole('navigation',{name:'Mudar idioma'}).getByRole('link',{name:'English',exact:true}).getAttribute('href');
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
 await page.locator('.ui-inspection-shell details').filter({has:page.getByText('Before you start',{exact:true})}).locator('summary').click();
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
 if(await page.getByRole('combobox',{name:'Device'}).inputValue()!=='laptop')throw Error('Laptop route did not select laptop device');
 await page.getByRole('heading',{name:'Laptop-specific troubleshooting before requesting repair'}).waitFor();
 await page.getByRole('heading',{name:'Internal panel versus external monitor'}).waitFor();
 await page.getByRole('heading',{name:'Angle and power changes'}).waitFor();
});
await check('/pt-br/pixel-morto-iphone',async page=>{
 if(await page.getByRole('combobox',{name:'Dispositivo'}).inputValue()!=='phone')throw Error('Portuguese iPhone route did not select phone device');
 await page.getByRole('heading',{name:'Verificações específicas para iPhone e celular'}).waitFor();
 await page.getByRole('heading',{name:'Safari e tela cheia'}).waitFor();
});
await check('/image-retention-test',async page=>{
 await page.getByRole('heading',{name:'Temporary retention and permanent OLED burn-in are not interchangeable'}).waitFor();
 await page.getByRole('heading',{name:'Neutral gray first'}).waitFor();
});
await check('/',async page=>{
 const body=await page.evaluate(()=>({surface:document.body.dataset.surface,bg:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.body).color}));
 if(body.surface!=='light'||body.bg!=='rgb(245, 247, 242)'||body.ink!=='rgb(25, 37, 34)')throw Error('Information page does not use light palette: '+JSON.stringify(body));
 const extent=await page.evaluate(()=>({body:document.body.getBoundingClientRect().height,document:document.documentElement.scrollHeight}));
 if(extent.body<extent.document-5)throw Error('Light page body ends before full page content, exposing dark root: '+JSON.stringify(extent));
 const workspace=page.getByText('Start your screen check',{exact:true}).locator('..');
 const bg=await workspace.evaluate(el=>getComputedStyle(el).backgroundColor);
 if(bg!=='rgb(10, 11, 14)')throw Error('Immersive workspace is not dark: '+bg);
 await page.screenshot({path:'smoke-screenshots/site-home-desktop.png',fullPage:true});
});
await check('/pt-br',async page=>{
 const bg=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
 if(bg!=='rgb(245, 247, 242)')throw Error('Brazilian information page uses an unexpected information surface');
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
 const wrongMode={...invalid,testMode:'lines',marks:[{...invalid.marks[0],xRatio:0.5}]};
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
   name:'wrong-mode.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(wrongMode))
 });
 if(await page.getByRole('button',{name:'Export self-check JSON'}).count())throw Error('Wrong test mode was imported into pixel report');
});
await check('/',async page=>{
 const report={
  kind:'user_observed_screen_inspection',certified:false,testMode:'pixels',
  createdAt:'2026-11-01T08:00:00.000Z',deviceType:'monitor',
  observedPatterns:['Black','White','Red'],marks:[{
   xRatio:0.25,yRatio:0.45,observedOn:['Black','Red'],notObservedOn:['White'],
   category:'stuck-color',notes:'Visible on selected patterns',
   viewportAtMark:{width:800,height:600,dpr:1,orientation:'landscape'}
  }]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'observations.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(report))
 });
 await page.getByText('Previous self-check loaded locally. Review each marked spot before continuing.').waitFor();
 await page.getByText(/viewport, scaling or orientation has changed/i).waitFor();
 await page.getByText('Color-by-color observation matrix').click();
 const table=page.getByRole('table').last();
 const black=table.getByRole('row',{name:/Black Visible/});
 const white=table.getByRole('row',{name:/White Not visible/});
 const blue=table.getByRole('row',{name:/Blue Not checked/});
 if(await black.count()!==1||await white.count()!==1||await blue.count()!==1)
  throw Error('Color-by-color matrix did not reflect all three observation states');
 const d=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export self-check JSON'}).click();
 const saved=JSON.parse(readFileSync(await (await d).path(),'utf8'));
 if(saved.viewportChangedSinceMark!==true||!saved.exportedAt)
  throw Error('Export does not document viewport change and export timestamp');
 const reportDownload=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download printable HTML report'}).click();
 const html=readFileSync(await (await reportDownload).path(),'utf8');
 if(!html.includes('The display viewport, scaling or orientation has changed'))
  throw Error('Printable report has no geometry warning');
});
await check('/',async page=>{
 const modeLess={
  kind:'user_observed_screen_inspection',certified:false,
  marks:[{xRatio:0.5,yRatio:0.5,observedOn:['Grid'],notObservedOn:[],
   category:'line-or-other',notes:'Grid from wrong mode',
   viewportAtMark:{width:1366,height:900,dpr:1,orientation:'landscape'}}]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'legacy-cross-mode.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(modeLess))
 });
 await page.getByText(/not a valid self-check report/i).waitFor();
 if(await page.getByRole('button',{name:'Export self-check JSON'}).count())
  throw Error('Legacy report imported a pattern not supported in the current test mode');
});
await check('/pt-br',async page=>{
 await page.getByRole('link',{name:'Pular para o conteúdo principal'}).waitFor();
 const mainLink=page.getByRole('navigation',{name:'Ferramentas'}).getByRole('link',{name:'Teste de pixel'});
 if(await mainLink.getAttribute('aria-current')!=='page')throw Error('Active Portuguese navigation route is not marked current');
 await page.getByRole('navigation',{name:'Informações legais'}).getByRole('link',{name:'Privacidade'}).waitFor();
 const theme=await page.locator('meta[name="theme-color"]').getAttribute('content');
 if(theme!=='#0D1416')throw Error('Information-site browser chrome does not match graphite navigation: '+theme);
});
await check('/tests/refresh-rate',async page=>{
 const theme=await page.locator('meta[name="theme-color"]').getAttribute('content');
 if(theme!=='#08090c')throw Error('Dark legacy tool theme color wrong: '+theme);
});
await check('/',async page=>{
 await page.getByRole('button',{name:'Start full-screen inspection'}).click();
 await page.getByRole('button',{name:'Hide controls'}).click();
 await page.waitForFunction(()=>{
   const dialog=document.querySelector('[role="dialog"]');
   return !!dialog?.contains(document.activeElement);
 },null,{timeout:3000});
 await page.keyboard.press('Tab');
 const afterTab=await page.evaluate(()=>!!document.querySelector('[role="dialog"]')?.contains(document.activeElement));
 if(!afterTab)throw Error('Tab from hidden controls escaped the dialog');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('[role="dialog"]'));
 const restored=await page.evaluate(()=>document.activeElement?.textContent?.includes('Start full-screen inspection'));
 if(!restored)throw Error('Exit did not restore focus to inspection start');
});
await check('/phone-screen-dead-pixel-test',async page=>{
 await page.getByRole('button',{name:'Start full-screen inspection'}).tap();
 await page.getByRole('button',{name:'Hide controls'}).tap();
 const compact=page.locator('[data-compact-controls="true"]');
 if(await compact.getAttribute('data-corner')!=='0')throw Error('Compact controls did not start in first corner');
 if(await page.getByRole('button',{name:'Next color'}).count())throw Error('Full toolbar remains visible in compact mode');
 const move=page.getByRole('button',{name:'Move controls to next corner'});
 for(let i=1;i<=4;i++){
   await move.tap();
   if(await compact.getAttribute('data-corner')!==String(i%4))throw Error('Compact control corner did not advance to '+i%4);
 }
 await page.getByRole('button',{name:'Show controls'}).tap();
 await page.getByRole('button',{name:'Next color'}).tap();
 await page.getByText('White (2/8)',{exact:true}).waitFor();
 await page.getByRole('button',{name:/Exit test/}).tap();
},{mobile:true,denyFullscreen:true});
await check('/',async page=>{
 const prior={
  kind:'user_observed_screen_inspection',certified:false,testMode:'pixels',
  deviceType:'monitor',observedPatterns:['Black'],
  marks:[{xRatio:.2,yRatio:.3,observedOn:['Black'],notObservedOn:[],
   category:'dark',notes:'Viewport regression',
   viewportAtMark:{width:1366,height:900,dpr:1,orientation:'landscape'}}]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'same-viewport.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(prior))
 });
 await page.getByText('Previous self-check loaded locally. Review each marked spot before continuing.').waitFor();
 const alert=page.getByText(/The display viewport, scaling or orientation has changed since a spot was recorded/i);
 if(await alert.count())throw Error('Same-sized viewport is incorrectly marked as changed');
 await page.setViewportSize({width:800,height:900});
 await alert.waitFor({timeout:5000});
 await page.setViewportSize({width:1366,height:900});
 await alert.waitFor({state:'hidden',timeout:5000});
});
await check('/',async page=>{
  await page.getByRole('button',{name:'Start full-screen inspection'}).click();
  await page.getByRole('button',{name:'Mark suspect spot'}).click();
  const surface=page.locator('[role="dialog"] [role="presentation"]');
  await surface.click({position:{x:160,y:180}});
  await surface.click({position:{x:300,y:270}});
  await page.getByRole('button',{name:/Exit test/}).click();
  const remove=page.getByRole('button',{name:'Remove'});
  if(await remove.count()!==2)throw Error('Expected two manually marked spots');
  // The second (selected) spot is removed; the first must become selected.
  await remove.nth(1).click();
  await page.getByText(/Suspect spots: 1/).waitFor();
  await page.getByRole('button',{name:'Start full-screen inspection'}).click();
  const picker=page.getByRole('combobox',{name:'Selected spot'});
  await picker.waitFor();
  if(!await picker.inputValue())throw Error('Removing selected mark lost selection of remaining spot');
  await page.getByRole('button',{name:'Still visible on this color'}).waitFor();
  await page.getByRole('button',{name:/Exit test/}).click();
});
// Localized task navigation must keep the same task where an equivalent page exists.
await check('/laptop-screen-dead-pixel-test',async page=>{
 const link=page.getByRole('link',{name:'Portuguese version of this topic'});
 if(await link.getAttribute('href')!=='/pt-br/pixel-morto-notebook')throw Error('Laptop locale switch lost its matching topic');
 await link.click();
 await page.getByRole('heading',{level:1,name:'Pixel Morto no Notebook'}).waitFor();
 const languageLinks=page.locator('link[rel="alternate"][hreflang]');
  if(await languageLinks.count()!==2)throw Error('Approved equivalent pages must publish reciprocal hreflang');
  const targets=await languageLinks.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  if(!targets.includes(canonicalOrigin+'/laptop-screen-dead-pixel-test')||!targets.includes(canonicalOrigin+'/pt-br/pixel-morto-notebook'))throw Error('Approved notebook hreflang points to incorrect pages: '+targets);
});
await check('/pt-br/reparar-pixel-preso',async page=>{
 const link=page.getByRole('link',{name:'English version of this topic'});
 if(await link.getAttribute('href')!=='/dead-pixel-fixer')throw Error('Fixer locale switch lost its matching topic');
 await link.click();
 await page.getByRole('heading',{level:1,name:'Stuck Pixel Check & Safe Retest'}).waitFor();
});
await check('/phone-screen-dead-pixel-test',async page=>{
 const link=page.getByRole('link',{name:'Portuguese home page'});
 if(await link.getAttribute('href')!=='/pt-br')throw Error('Non-equivalent phone page should link to Portuguese homepage');
 const text=await page.locator('nav[aria-label="Switch language"]').innerText();
 if(!text.includes('página inicial'))throw Error('Language switch fallback not explained to readers');
});

for(const [path,heading,example] of [
 ['/laptop-screen-dead-pixel-test','Laptop screen symptoms: what to check next','Single dark point on white'],
 ['/pt-br/pixel-morto-notebook','Pixel morto no notebook: como interpretar o sintoma','Ponto escuro no fundo branco'],
 ['/dead-pixel-fixer','Does this symptom need a pixel fixer?','Always-dark point in several colors'],
 ['/pt-br/reparar-pixel-preso','Pixel preso: qual próximo passo é seguro?','Ponto sempre escuro em várias cores']
]){
 await check(path,async page=>{
   const guide=page.locator('[data-symptom-decision]');
   await guide.getByRole('heading',{name:heading}).waitFor();
   if(await guide.locator('details').count()!==4)throw Error('Expected four diagnosis choices');
   await guide.locator('summary').filter({hasText:example}).click();
   const expanded=guide.locator('details[open]');
   if(await expanded.count()!==1)throw Error('Decision guide did not expand');
   const content=await expanded.innerText();
   if(!content.includes(path.startsWith('/pt-br')?'Próximo passo':'Next step'))throw Error('Symptom advice missing a next action');
   if(await guide.locator('a[href*="dell.com/support/kbdoc"]').count()!==1)throw Error('Missing manufacturer reference');
 });
}
await check('/screen-resolution-test',async page=>{
 for(const selector of ['#copy-screen-metrics','#manual-ppi button[type="submit"]','#ppi-result']){
  const ratio=await page.locator(selector).evaluate(el=>{
   const luminosity=color=>{
    const vals=(color.match(/[0-9.]+/g)||[]).slice(0,3).map(Number).map(n=>n/255);
    const linear=vals.map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
    return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
   };
   let bg='rgb(255,255,255)',node=el;
   while(node){
    const found=getComputedStyle(node).backgroundColor;
    if(found&&found!=='transparent'&&found!=='rgba(0, 0, 0, 0)'){bg=found;break;}
    node=node.parentElement;
   }
   const fg=getComputedStyle(el).color;
   const [low,high]=[luminosity(bg),luminosity(fg)].sort((a,b)=>a-b);
   return (high+.05)/(low+.05);
  });
  if(!(ratio>=4.5))throw Error('Low contrast on '+selector+': '+ratio.toFixed(2));
 }
});
{
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await ctx.newPage();
 try{
  const result=await page.goto(base+'/pt-br/pixel-morto-notebook',{waitUntil:'domcontentloaded'});
  if(result?.status()!==200)throw Error('No-JS laptop page not served');
  const guide=page.locator('[data-symptom-decision]');
  if(await guide.locator('details').count()!==4)throw Error('No-JS HTML lost visible decision guide');
  await guide.locator('summary').first().click();
  if(!await guide.locator('details').first().evaluate(el=>el.open))throw Error('Native no-JS decision guide not interactive');
  console.log('PASS browser: no-JavaScript Portuguese laptop guidance');
 }catch(error){failures.push('no-JS Portuguese laptop: '+error.message);}
 finally{await ctx.close();}
}


for(const path of ['/tests/refresh-rate','/tests/local-dimming','/tests/color-gradient','/tests/audio-sync','/tests/test-patterns']){
 await check(path,async page=>{
  const guide=page.locator('#legacy-static-guide');
  await guide.waitFor();
  const ratio=await guide.evaluate(el=>{
   const luminance=(color)=>{
    const rgb=(color.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    if(rgb.length!==3)return NaN;
    const [r,g,b]=rgb.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
    return 0.2126*r+0.7152*g+0.0722*b;
   };
   const bg=getComputedStyle(el).backgroundColor;
   const fg=getComputedStyle(el).color;
   const a=luminance(bg),b=luminance(fg);
   return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  if(!(ratio>=4.5))throw Error('Static guide text contrast below 4.5:1: '+ratio);
  const headingRatio=await guide.locator('h2').evaluate(h=>{
   const rgb=(s)=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
   const lum=(s)=>{const [r,g,b]=rgb(s).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;};
   const text=lum(getComputedStyle(h).color),back=lum(getComputedStyle(h.closest('section')).backgroundColor);
   return (Math.max(text,back)+.05)/(Math.min(text,back)+.05);
  });
  if(!(headingRatio>=4.5))throw Error('Static guide heading is visually unreadable: '+headingRatio);
  if(!await guide.getByText('Practical inspection steps').count())throw Error('Legacy static guide steps missing');
  if(!await guide.getByText('What the result cannot prove').count())throw Error('Legacy static guide limitations missing');
 });
}


await check('/tests/refresh-rate',async page=>{
 const previous=await page.locator('link[rel="canonical"]').getAttribute('href');
 const navigation=page.waitForNavigation({waitUntil:'domcontentloaded',timeout:12000});
 await page.getByRole('link',{name:'DeadPixelTest Home'}).click();
 await navigation;
 if(await page.locator('html').getAttribute('data-surface')!=='light')
  throw Error('React soft navigation bypassed Astro homepage HTML');
 if(await page.locator('main h1').first().textContent()!=='Dead Pixel Test')
  throw Error('Astro homepage main heading not loaded');
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
 if(canonical===previous||canonical!==canonicalOrigin+'/')
  throw Error('Static homepage canonical was not refreshed: '+canonical);
});
await check('/tests/local-dimming',async page=>{
 const navigation=page.waitForNavigation({waitUntil:'domcontentloaded',timeout:12000});
 await page.locator('footer').getByRole('link',{name:'Color Gradient',exact:true}).click();
 await navigation;
 await page.getByRole('heading',{name:'How to identify visible color banding'}).waitFor();
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
 if(canonical!==canonicalOrigin+'/tests/color-gradient')
  throw Error('Legacy tool navigation retained stale canonical '+canonical);
});
for(const path of ['/pt-br/pixel-morto-notebook','/pt-br/reparar-pixel-preso']){
 await check(path,async page=>{
  const url=await page.locator('[data-symptom-decision] a[href*="dell.com/support/kbdoc"]').getAttribute('href');
  if(!url?.includes('/pt-br/000126004/diretrizes-de-pixels-da-tela-dell'))
   throw Error('Brazilian screen-check page links to non-localized manufacturer guidance: '+url);
 });
}
await check('/tests/refresh-rate',async page=>{
 // The command palette is a hydrated React island, not part of Astro's initial HTML.
 await page.getByRole('link',{name:'DeadPixelTest Home'}).waitFor({timeout:12000});
 await page.keyboard.press('Control+k');
 const field=page.getByRole('textbox',{name:'Search tools'});
 await field.waitFor();
 await field.fill('Teste de Pixel Morto (Brasil)');
 await field.press('Enter');
 // React Router can first push a same-document history entry. Only accept Astro's
 // new HTML after both language and surface metadata have changed.
 try{
  await page.locator('html[lang="pt-BR"][data-surface="light"]').waitFor({timeout:15000});
 }catch(error){
  throw Error('Command palette landed at '+page.url()+' with HTML lang '+
   await page.locator('html').getAttribute('lang')+'; '+String(error));
 }
 await page.getByRole('heading',{level:1,name:'Teste de Pixel Morto'}).waitFor();
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
 if(canonical!==canonicalOrigin+'/pt-br')
  throw Error('Command palette navigation did not refresh Astro canonical: '+canonical);
});

await check('/tests/refresh-rate',async page=>{
 await page.getByRole('link',{name:'DeadPixelTest Home'}).waitFor();
 await page.keyboard.press('Control+k');
 const input=page.getByRole('textbox',{name:'Search tools'});
 await input.waitFor();
 await input.fill('Color Gradient');
 const navigation=page.waitForNavigation({waitUntil:'domcontentloaded',timeout:12000});
 await page.getByRole('navigation',{name:'Search results'}).getByRole('link',{name:'Color Gradient',exact:true}).click();
 await navigation;
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
 if(canonical!==canonicalOrigin+'/tests/color-gradient')throw Error('Search result link bypassed the Astro document: '+canonical);
 await page.getByRole('heading',{name:'How to identify visible color banding'}).waitFor();
});
await check('/',async page=>{
 const prior={
  kind:'user_observed_screen_inspection',certified:false,testMode:'pixels',
  createdAt:'2026-11-08T05:11:00.000Z',deviceType:'laptop',
  observedPatterns:['Black','White','Red'],
  marks:[{xRatio:0.3,yRatio:0.4,observedOn:['Black','Red'],notObservedOn:['White'],
    category:'dark',notes:'<script>do not run</script>',
    viewportAtMark:{width:1440,height:900,dpr:2,orientation:'landscape-primary'}}]
 };
 await page.getByLabel('Import previous JSON report (local only)').setInputFiles({
  name:'evidence.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(prior))
 });
 await page.getByText('Previous self-check loaded locally. Review each marked spot before continuing.').waitFor();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download printable HTML report'}).click();
 const html=readFileSync(await (await download).path(),'utf8');
 for(const text of ['Test mode','Viewport at mark','1440 × 900 CSS px; DPR 2; landscape-primary',
  'Color-by-color observations','Not checked','Not visible','Visible','Patterns viewed',
  '2026-11-08T05:11:00.000Z','&lt;script&gt;do not run&lt;/script&gt;']){
  if(!html.includes(text))throw Error('Printable HTML lost evidence: '+text);
 }
 if(html.includes('<script>do not run</script>'))throw Error('Report contains executable imported text');
 if(!html.includes('window.print()'))throw Error('Printable offline report has no explicit print action');
});
await check('/tests/refresh-rate',async page=>{
 const opener=page.getByRole('link',{name:'DeadPixelTest Home'});
 await opener.focus();
 await page.keyboard.press('Control+k');
 const dialog=page.getByRole('dialog',{name:'Search tools'});
 const search=dialog.getByRole('textbox',{name:'Search tools'});
 await search.waitFor();
 await page.waitForFunction(()=>document.activeElement===document.querySelector('input[aria-label="Search tools"]'),null,{timeout:12000});
 await page.keyboard.press('Shift+Tab');
 await page.waitForFunction(()=>document.activeElement===Array.from(document.querySelectorAll('[role="dialog"] a[href]')).at(-1),null,{timeout:12000});
 await page.keyboard.press('Tab');
 if(!await search.evaluate(el=>el===document.activeElement))throw Error('Tab did not wrap back to input');
 await search.fill('impossible query 32589');
 await dialog.getByText('No results found.').waitFor();
 await page.keyboard.press('Shift+Tab');
 if(!await dialog.getByRole('button',{name:'Close search'}).evaluate(el=>el===document.activeElement))
  throw Error('Empty-result Tab order did not wrap to close control');
 await page.keyboard.press('Escape');
 await dialog.waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='DeadPixelTest Home');
 await page.keyboard.press('Control+k');
 await search.waitFor();
 await dialog.getByRole('button',{name:'Close search'}).click();
 await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='DeadPixelTest Home');
});
await check('/image-retention-test',async page=>{
 const section=page.getByRole('region',{name:'Manufacturer OLED care resources'});
 await section.getByRole('heading',{name:'Manufacturer OLED panel-care guides'}).waitFor();
 const samsung=await section.getByRole('link',{name:/Samsung OLED monitor/}).getAttribute('href');
 const lg=await section.getByRole('link',{name:/LG OLED TV/}).getAttribute('href');
 if(!samsung?.startsWith('https://www.samsung.com/sg/support/displays/')||!lg?.startsWith('https://www.lg.com/us/support/help-library/'))
  throw Error('Manufacturer source targets are missing or changed');
 if(!await section.getByText(/not features of this website/).count())
  throw Error('Manufacturer maintenance functions not distinguished from web testing');
});

await check('/',async page=>{
 const nav=page.getByRole('navigation',{name:'Tools'});
 const feature=page.locator('a.ui-feature-card').first();
 if(!await feature.count())throw Error('Homepage tool cards missing');
 if((await nav.locator('a[aria-current="page"]').count())!==1)throw Error('Homepage has no current tool marker');
 const hero=page.locator('.ui-hero-intro');
 const anim=await hero.evaluate(el=>getComputedStyle(el).animationName);
 if(anim==='none')throw Error('Page entry motion missing without reduced-motion preference');
 await page.getByRole('button',{name:'Start full-screen inspection'}).click();
 const surface=page.locator('[role="dialog"] [role="presentation"]');
 await surface.waitFor();
 if(await surface.evaluate(el=>getComputedStyle(el).animationName)!=='none')
  throw Error('Live inspection surface should not auto-animate');
 await page.getByRole('button',{name:'Exit test'}).click();
});
await check('/pt-br/pixel-morto-notebook',async page=>{
 const details=page.locator('details.ui-disclosure').first();
 await details.locator('summary').click();
 if(!await details.evaluate(el=>el.open))throw Error('Native symptom detail failed to expand');
 if(!await page.locator('.ui-landing-hero').count())throw Error('Published PT landing hero missing');
});
await check('/',async page=>{
 await page.setViewportSize({width:360,height:780});
 const sizes=await page.evaluate(()=>({screen:innerWidth,document:document.documentElement.scrollWidth}));
 if(sizes.document>sizes.screen+2)throw Error('Mobile header overflow after visual refinement '+JSON.stringify(sizes));
 const link=page.getByRole('navigation',{name:'Tools'}).locator('a').first();
 const rect=await link.boundingBox();
 if(!rect||rect.height<43)throw Error('Mobile tools navigation tap target too short');
 await page.emulateMedia({reducedMotion:'reduce'});
 const anim=await page.locator('.ui-hero-intro').evaluate(el=>getComputedStyle(el).animationDuration);
 if(parseFloat(anim)>0.001)throw Error('Reduced-motion animation not suppressed: '+anim);
 const transform=await page.locator('a.ui-feature-card').first().evaluate(el=>getComputedStyle(el).transform);
 if(transform!=='none')throw Error('Reduced-motion feature card moves unexpectedly');
});


await check('/',async page=>{
 const stage=page.locator('.ui-home-stage');
 const stageColor=await stage.evaluate(el=>getComputedStyle(el).backgroundColor);
 if(stageColor!=='rgb(13, 20, 22)')throw Error('Premium dark instrument surface is missing: '+stageColor);
 await page.getByRole('button',{name:'Start full-screen inspection'}).waitFor();
 const label=await page.getByRole('combobox',{name:/Device/}).first().locator('..').evaluate(el=>{
  const cs=getComputedStyle(el);
  return {color:cs.color,background:getComputedStyle(el.closest('.ui-inspection-shell')).backgroundColor};
 });
 if(label.color!=='rgb(243, 250, 241)'||label.background!=='rgb(10, 11, 14)')
  throw Error('Device label is unreadable against diagnostic workbench: '+JSON.stringify(label));
 const action=await page.getByRole('button',{name:'Start full-screen inspection'}).evaluate(el=>{
  const cs=getComputedStyle(el);return {background:cs.backgroundColor,color:cs.color};
 });
 if(action.background!=='rgb(197, 242, 119)'||action.color!=='rgb(21, 32, 21)')
  throw Error('Primary CTA color contrast differs from chosen design tokens: '+JSON.stringify(action));
 await page.setViewportSize({width:360,height:780});
 if(await page.locator('.ui-preview-instrument').isVisible())
  throw Error('Decorative screen sample displaces mobile Start action below the fold');
 const button=await page.getByRole('button',{name:'Start full-screen inspection'}).boundingBox();
 if(!button||button.y+button.height>780)throw Error('Start inspection must be available within initial mobile viewport: '+JSON.stringify(button));
});

await check('/',async page=>{
 const details=page.locator('.ui-inspection-shell details').filter({has:page.getByText('Before you start',{exact:true})});
 await details.waitFor();
 if(await details.evaluate(el=>el.open))throw Error('Long preflight checklist should be collapsible');
 await details.locator('summary').click();
 if(!await details.evaluate(el=>el.open))throw Error('Preflight checklist failed to expand');
});

await check('/tests/refresh-rate',async page=>{
 const header=page.locator('header').first();
 if(!(await header.getAttribute('class'))?.includes('bg-[#0D1416]'))
  throw Error('Legacy tools do not share the graphite site header');
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Open Menu'}).click();
 const mobile=page.getByRole('navigation',{name:'Mobile navigation'});
 await mobile.getByRole('link',{name:'Uniformity',exact:true}).waitFor();
 await page.getByRole('button',{name:'Close Menu'}).click();
 await page.waitForFunction(()=>document.querySelector('#mobile-site-menu')?.getAttribute('aria-hidden')==='true',null,{timeout:5000});
});

await check('/pt-br/pixel-morto-notebook',async page=>{
 const links=page.locator('.ui-related-link');
 if(await links.count()<3)throw Error('Localized related-test links missing');
 for(const link of await links.all()){
  const metrics=await link.evaluate(el=>el.getBoundingClientRect().height);
  if(metrics>118)throw Error('Related-test link has unnecessary vertical blank space: '+metrics);
  if(!await link.locator('.ui-related-link-arrow').count())throw Error('Related link has no directional cue');
 }
 await page.setViewportSize({width:360,height:780});
 const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
 if(width.document>width.viewport+2)throw Error('Localized SEO page has mobile horizontal overflow: '+JSON.stringify(width));
 await page.getByRole('heading',{name:'Como fazer o teste'}).waitFor();
 if(!await page.locator('.ui-safety-note').count())throw Error('Localized safety guidance omitted');
});
await check('/laptop-screen-dead-pixel-test',async page=>{
 const related=page.locator('section[aria-label="Related tests"] a.ui-related-link');
 if(await related.count()<3)throw Error('EN SEO page has no relevant tool links');
 for(const link of await related.all()){
  const href=await link.getAttribute('href');
  if(!href?.startsWith('/'))throw Error('Related link is not same-origin path');
 }
});

await check('/screen-resolution-test',async page=>{
 const cards=page.locator('.ui-landing-hero .ui-metrics-panel');
 if(await cards.count()!==3)throw Error('Three resolution panels expected');
 for(const card of await cards.all()){
  const x=await card.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color}));
  if(x.bg!=='rgb(250, 253, 248)'||x.fg!=='rgb(28, 44, 35)')
    throw Error('Resolution text/background contrast mismatch: '+JSON.stringify(x));
 }
 await page.setViewportSize({width:360,height:780});
 const d=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
 if(d.scroll>d.w+2)throw Error('Resolution calculator mobile overflow');
 await page.screenshot({path:'smoke-screenshots/site-resolution-360.png',fullPage:true});
 await page.getByLabel('Native width (physical pixels)').fill('2560');
 await page.getByLabel('Native height (physical pixels)').fill('1440');
 await page.getByLabel('Screen diagonal (inches)').fill('27');
 await page.getByRole('checkbox',{name:/I checked the native physical resolution/i}).check();
 await page.getByRole('button',{name:'Calculate PPI'}).click();
 await page.getByText(/108\.79 PPI/).waitFor();
});

for(const [route,message] of [['/','JavaScript is disabled.'],['/pt-br','JavaScript está desativado.']]){
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await context.newPage();
 try{
  const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
  if(response?.status()!==200)throw Error('Unexpected HTTP status '+response?.status());
  await page.getByText(message,{exact:true}).waitFor({timeout:5000});
  if(await page.getByRole('button',{name:/Start full-screen inspection|Iniciar inspeção em tela cheia/}).count())throw Error('Hydrated start button unexpectedly available without JavaScript');
  if(!await page.locator('main#main-content').count())throw Error('No static accessible content');
  console.log('PASS browser: no-JavaScript fallback '+route);
 }catch(error){
  failures.push('no-JS '+route+': '+error.message);
  console.error('FAIL browser: no-JS '+route+': '+error.message);
 }finally{await context.close();}
}
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS all '+89+' Chromium browser scenarios, including orientation/resize rechecks and compact controls');
