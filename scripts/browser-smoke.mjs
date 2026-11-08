import {chromium, devices} from 'playwright';
import {mkdirSync} from 'node:fs';
const base=process.env.SMOKE_BASE || 'http://127.0.0.1:4321';
mkdirSync('smoke-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
async function check(url,fn,{mobile=false}={}){
 const ctx=await browser.newContext(mobile?{...devices['iPhone 13'],browserName:undefined}:{viewport:{width:1366,height:900}});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const res=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:15000});
  if(res?.status()!==200)throw Error('HTTP '+res?.status());
  await fn(page);
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
 if(!canon?.startsWith('https://deadpixeltest.cc/'))throw Error('Canonical '+canon);
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
await check('/pt-br/',async page=>{
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).waitFor({timeout:12000});
 if(await page.locator('html').getAttribute('lang')!=='pt-BR')throw Error('Missing pt-BR language');
 await page.getByRole('button',{name:/Iniciar inspeção em tela cheia/i}).click();
 await page.getByRole('button',{name:/Sair do teste/i}).click();
},{mobile:true});
await check('/laptop-screen-dead-pixel-test/',expectedTitle('Laptop Dead Pixel Test'));
await check('/pt-br/pixel-morto-notebook/',expectedTitle('Pixel Morto'));
await check('/tests/refresh-rate',async page=>{
 await expectedTitle('Frame Skipping')(page);
 await page.getByText(/Refresh Rate|Frame Skipping/i).first().waitFor({timeout:15000});
});
await check('/tests/local-dimming',async page=>{
 await expectedTitle('Local Dimming')(page);
 await page.getByText(/Local Dimming/i).first().waitFor({timeout:15000});
});
await check('/tests/color-gradient',expectedTitle('Color Banding'));
await check('/image-retention-test/',expectedTitle('Image Retention'));
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS all '+8+' browser smoke scenarios');
