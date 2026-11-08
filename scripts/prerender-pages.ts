import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {SEO_LANDING_PAGES} from '../data/seoLandingPages';

// This project retains its proven Vite/React client navigation. Rendering a
// complete content document at each new SEO URL avoids a blank SPA shell for
// non-JS fetchers, while the React app upgrades it to an interactive tool.
const dist='dist';
const shell=join(dist,'index.html');
if(!existsSync(shell))throw new Error('Build dist/index.html before prerender.');
const base=readFileSync(shell,'utf8');

function htmlEscape(s:string){
 return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function pageHtml(page:typeof SEO_LANDING_PAGES[number]){
 const alternateLinks = (() => {
  const counterpart = SEO_LANDING_PAGES.find(p=>p.path!==page.path && (
   (page.path==='/pt-br/'&&p.path==='/') || (page.path==='/laptop-screen-dead-pixel-test/'&&p.path==='/pt-br/pixel-morto-notebook/') ||
   (page.path==='/dead-pixel-fixer/'&&p.path==='/pt-br/reparar-pixel-preso/') ||
   (page.path==='/what-is-a-dead-pixel/'&&p.path==='/pt-br/o-que-e-dead-pixel/') ||
   (page.path==='/pt-br/pixel-morto-notebook/'&&p.path==='/laptop-screen-dead-pixel-test/') ||
   (page.path==='/pt-br/reparar-pixel-preso/'&&p.path==='/dead-pixel-fixer/') ||
   (page.path==='/pt-br/o-que-e-dead-pixel/'&&p.path==='/what-is-a-dead-pixel/')
  ));
  if(!counterpart)return '';
  const pair=[page,counterpart];
  return pair.map(p=>'<link rel="alternate" hreflang="'+p.lang+'" href="https://deadpixeltest.cc'+p.path+'">').join('');
 })();
 const body='<main style="font-family:system-ui,sans-serif;max-width:900px;margin:48px auto;padding:24px;line-height:1.65;color:#ededed;background:#090909">'+
  '<header><a href="/" style="color:#a3c7ff">DeadPixelTest — Screen checks</a></header>'+
  '<h1>'+htmlEscape(page.h1)+'</h1><p>'+htmlEscape(page.lead)+'</p>'+
  '<p><strong>'+(page.lang==='pt-BR'?'Ferramenta interativa:':'Interactive test:')+'</strong> '+(page.lang==='pt-BR'?'Ative o JavaScript para iniciar o teste visual no navegador.':'Enable JavaScript to start the browser-based visual inspection.')+'</p>'+
  '<section><h2>'+(page.lang==='pt-BR'?'Como fazer o teste':'How to run this test')+'</h2><ol>'+page.steps.map(s=>'<li>'+htmlEscape(s)+'</li>').join('')+'</ol></section>'+
  '<section><h2>'+(page.lang==='pt-BR'?'Orientações importantes':'Important limitations')+'</h2>'+page.notes.map(s=>'<p>'+htmlEscape(s)+'</p>').join('')+'</section>'+
  '<section><h2>'+(page.lang==='pt-BR'?'Perguntas frequentes':'Frequently asked questions')+'</h2>'+page.faq.map(q=>'<h3>'+htmlEscape(q.question)+'</h3><p>'+htmlEscape(q.answer)+'</p>').join('')+'</section>'+
  '<footer><p>Manual screen self-check — not a hardware certification.</p></footer></main>';
 return base
  .replace('<html lang="en">','<html lang="'+page.lang+'">')
  .replace(/<title>[\s\S]*?<\/title>/,'<title>'+htmlEscape(page.title)+'</title>')
  .replace(/<meta name="description" content="[^"]*"\s*\/>/,'<meta name="description" content="'+htmlEscape(page.description)+'" />')
  .replace('</head>','<link rel="canonical" href="https://deadpixeltest.cc'+page.path+'">'+alternateLinks+'</head>')
  .replace(/<div id="root">[\s\S]*?<\/div>\s*<script type="module"/,'<div id="root">'+body+'</div>\n<script type="module"');
}
let count=0;
for(const page of SEO_LANDING_PAGES){
 if(page.path==='/')continue; // Home is a high-traffic legacy page; do not replace its existing content.
 const filepath=join(dist,page.path,'index.html');
 mkdirSync(dirname(filepath),{recursive:true});
 writeFileSync(filepath,pageHtml(page),'utf8');
 count++;
}
console.log('Prerendered '+count+' dedicated landing pages. Existing /tests/* preserved.');
