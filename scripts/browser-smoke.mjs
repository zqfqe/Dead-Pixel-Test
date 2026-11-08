import {chromium, devices} from 'playwright';
import {mkdirSync} from 'node:fs';
const base=process.env.SMOKE_BASE || 'http://127.0.0.1:4321';
const canonicalOrigin=process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL).origin : '';
const baseOrigin=new URL(base).origin;
mkdirSync('smoke-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
async function check(url,fn,{mobile=false,denyFullscreen=false,media=false}={}){
 const ctx=await browser.newContext(mobile?{...devices['iPhone 13'],browserName:undefined}:{viewport:{width:1366,height:900}});
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
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS all '+16+' browser smoke scenarios including local-only network and media checks');
