import { firefox, webkit, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const base=process.env.SMOKE_BASE || 'http://127.0.0.1:4321';
mkdirSync('smoke-screenshots',{recursive:true});
const failures=[];

async function scenario(engine,name,path,run,{mobile=false}={}){
 const context=await engine.newContext(mobile?{...devices['iPhone 13']}:{viewport:{width:1280,height:800}});
 await context.addInitScript(()=>{
  Element.prototype.requestFullscreen=function(){return Promise.reject(new Error('Fullscreen intentionally unavailable in cross-browser test'));};
 });
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  const res=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:20000});
  if(res?.status()!==200)throw Error('HTTP '+res?.status()+' for '+path);
  await run(page);
  if(errors.length)throw Error('Runtime errors: '+errors.join('; '));
  console.log('PASS cross-browser '+name+' '+path+(mobile?' mobile':''));
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  failures.push(name+' '+path+': '+message);
  console.error('FAIL cross-browser '+name+' '+path+': '+message);
  await page.screenshot({path:'smoke-screenshots/cross-'+name+path.replaceAll('/','_')+'.png',fullPage:true}).catch(()=>{});
 }finally{await context.close();}
}

for(const [name,engine] of [['firefox',firefox],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 try{
  await scenario(browser,name,'/',async page=>{
   await page.getByRole('button',{name:'Start full-screen inspection'}).click();
   await page.getByText('Black (1/8)',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Next color'}).click();
   await page.getByText('White (2/8)',{exact:true}).waitFor();
   await page.getByRole('button',{name:/Exit test/}).click();
  });
  await scenario(browser,name,'/pt-br',async page=>{
   await page.getByRole('button',{name:'Iniciar inspeção em tela cheia'}).click();
   await page.getByRole('button',{name:'Ir para Amarelo'}).click();
   await page.getByText('Amarelo (8/8)',{exact:true}).waitFor();
   await page.getByRole('button',{name:/Sair do teste/}).click();
  });
  await scenario(browser,name,'/screen-contrast-test',async page=>{
   await page.getByRole('button',{name:'Start full-screen inspection'}).click();
   await page.getByRole('button',{name:'Jump to Color bars'}).click();
   await page.getByText('Color bars (11/14)',{exact:true}).waitFor();
   await page.getByRole('button',{name:/Exit test/}).click();
  });
  await scenario(browser,name,'/dead-pixel-fixer',async page=>{
   await page.getByRole('button',{name:'Start full-screen inspection'}).click();
   const patch=page.getByLabel('Static patch color');
   await patch.fill('#00ff00');
   await page.getByRole('button',{name:/Exit test/}).click();
  });
  await scenario(browser,name,'/screen-resolution-test',async page=>{
   await page.getByLabel('Native width (physical pixels)').fill('1920');
   await page.getByLabel('Native height (physical pixels)').fill('1080');
   await page.getByLabel('Screen diagonal (inches)').fill('24');
   await page.getByRole('checkbox',{name:/I checked the native physical resolution/}).check();
   await page.getByRole('button',{name:'Calculate PPI'}).click();
   await page.getByText(/91\.79 PPI/).waitFor();
  });
  await scenario(browser,name,'/phone-screen-dead-pixel-test',async page=>{
   await page.getByRole('button',{name:'Start full-screen inspection'}).tap();
   await page.getByRole('button',{name:'Hide controls'}).tap();
   const controls=page.locator('[data-compact-controls="true"]');
   await controls.waitFor();
   await page.getByRole('button',{name:'Move controls to next corner'}).tap();
   if(await controls.getAttribute('data-corner')!=='1')throw Error('Compact controls failed to reposition on mobile '+name);
   await page.getByRole('button',{name:'Show controls'}).tap();
   await page.getByRole('button',{name:/Exit test/}).tap();
  },{mobile:true});
  await scenario(browser,name,'/phone-screen-dead-pixel-test',async page=>{
   const width=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
   if(width[1]>width[0]+2)throw Error('Page horizontally overflows '+width);
   await page.getByRole('button',{name:'Start full-screen inspection'}).tap();
   await page.getByRole('button',{name:'Jump to Blue'}).tap();
   await page.getByText('Blue (5/8)',{exact:true}).waitFor();
   await page.getByRole('button',{name:/Exit test/}).tap();
  },{mobile:true});
 }finally{await browser.close();}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS 14 Firefox/WebKit responsive, compact-control and inspection scenarios');
